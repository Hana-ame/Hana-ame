package xyz.moonchan.camera.server;

import android.content.Context;
import android.util.Log;

import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.core.content.ContextCompat;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;

import org.nanohttpd.IHTTPSession;
import org.nanohttpd.NanoHTTPD;

public class CameraHttpServer extends NanoHTTPD {
    private static final String TAG = "CameraHttpServer";
    private final Context context;
    private final ImageCapture imageCapture;

    public CameraHttpServer(int port, Context context, ImageCapture imageCapture) {
        super(port);
        this.context = context;
        this.imageCapture = imageCapture;
    }

    @Override
    public org.nanohttpd.Response serve(IHTTPSession session) {
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
        File photoFile = new File(context.getExternalFilesDir(null), "temp.jpg");
        ImageCapture.OutputFileOptions outputOptions = new ImageCapture.OutputFileOptions.Builder(photoFile).build();

        imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(context), 
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
                public void onError(ImageCaptureException ex) {
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
