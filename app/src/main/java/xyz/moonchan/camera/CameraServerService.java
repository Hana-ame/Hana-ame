package xyz.moonchan.camera;

import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import android.util.Size;

import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleService;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.nanohttpd.IHTTPSession;
import org.nanohttpd.NanoHTTPD;
import org.nanohttpd.Response;

public class CameraServerService extends LifecycleService {
    private static final String TAG = "CameraServer";
    private CameraHttpServer server;
    private ImageCapture imageCapture;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service onCreate");
        
        startCamera();
        
        server = new CameraHttpServer(8000);
        server.start();
        Log.d(TAG, "HTTP Server started on port 8000");
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
            ProcessCameraProvider.getInstance(this);
        
        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build();

                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;

                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, imageCapture);
                Log.d(TAG, "CameraX initialized");
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Camera initialization failed", e);
            }
        }, ContextCompat.getMainExecutor(this));
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (server != null) {
            server.stop();
        }
        Log.d(TAG, "Service onDestroy");
    }

    private class CameraHttpServer extends NanoHTTPD {
        public CameraHttpServer(int port) {
            super(port);
        }

        @Override
        public Response serve(IHTTPSession session) {
            Log.d(TAG, "Request received: " + session.getUri());
            try {
                byte[] imageBytes = captureImage();
                return new org.nanohttpd.Response(org.nanohttpd.Response.Status.OK, "image/jpeg", new java.io.ByteArrayInputStream(imageBytes));
            } catch (Exception e) {
                Log.e(TAG, "Capture failed", e);
                return new org.nanohttpd.Response(org.nanohttpd.Response.Status.INTERNAL_ERROR, "text/plain", "Capture failed: " + e.getMessage());
            }
        }

        private byte[] captureImage() throws Exception {
            if (imageCapture == null) {
                throw new Exception("Camera not initialized");
            }

            final CompletableFuture<byte[]> future = new CompletableFuture<>();
            
            File photoFile = new File(getExternalFilesDir(null), "temp.jpg");
            ImageCapture.OutputFileOptions outputOptions = new ImageCapture.OutputFileOptions.Builder(photoFile).build();

            imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(CameraServerService.this), 
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(ImageCapture.OutputFileResults output) {
                        try {
                            byte[] bytes = readAllBytes(photoFile);
                            photoFile.delete();
                            future.complete(bytes);
                        } catch (IOException e) {
                            future.completeExceptionally(e);
                        }
                    }

                    @Override
                    public void onError(int exceptionCode, ImageCaptureException ex) {
                        future.completeExceptionally(ex);
                    }
                });

            return future.get();
        }

        private byte[] readAllBytes(File file) throws IOException {
            FileInputStream fis = new FileInputStream(file);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int read;
            while ((read = fis.read(buffer)) != -1) {
                bos.write(buffer, 0, read);
            }
            fis.close();
            return bos.toByteArray();
        }
    }
}
