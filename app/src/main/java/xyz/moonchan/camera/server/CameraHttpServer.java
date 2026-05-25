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
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.CompletableFuture;

public class CameraHttpServer implements Runnable {
    private static final String TAG = "CameraHttpServer";
    private final int port;
    private final Context context;
    private final ImageCapture imageCapture;
    private volatile boolean running = true;
    private ServerSocket serverSocket;

    public CameraHttpServer(int port, Context context, ImageCapture imageCapture) {
        this.port = port;
        this.context = context;
        this.imageCapture = imageCapture;
    }

    @Override
    public void run() {
        try {
            serverSocket = new ServerSocket(port);
            Log.d(TAG, "HTTP Server started on port " + port);
            while (running) {
                Socket client = serverSocket.accept();
                new Thread(() -> handleClient(client)).start();
            }
        } catch (IOException e) {
            Log.e(TAG, "Server error", e);
        }
    }

    private void handleClient(Socket client) {
        try (InputStream in = client.getInputStream();
             OutputStream out = client.getOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int read = in.read(buffer);
            if (read == -1) return;
            
            byte[] imageBytes = captureImage();
            
            String header = "HTTP/1.1 200 OK\r\n" +
                            "Content-Type: image/jpeg\r\n" +
                            "Content-Length: " + imageBytes.length + "\r\n" +
                            "Connection: close\r\n\r\n";
            
            out.write(header.getBytes());
            out.write(imageBytes);
            out.flush();
        } catch (Exception e) {
            Log.e(TAG, "Client handle error", e);
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

    public void stop() {
        running = false;
        try {
            if (serverSocket != null) serverSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
