package top.hana_sweet.portforwarder;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

public class PFService extends Service{
    //Service启动时调用
    @Override
    public void onCreate() {
        super.onCreate();
        Log.v("wang", "OnCreate 服务启动时调用");
        new Thread(new TcpForwarder(3389,"192.168.42.1",3389)).start();
    }
    @Override
    public IBinder onBind(Intent intent) {
        // TODO Auto-generated method stub
        // 不知道是啥，没反应
        return null;
    }
    //服务被关闭时调用
    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.v("wang", "onDestroy 服务关闭时");
    }

}

class TcpForwarder implements Runnable{
    private int localPort;
    private String destAddr;
    private int destPort;
    private ServerSocket localServer;

    private boolean isWorking = false;
    TcpForwarder(int localPort, String destAddr, int destPort){
        this.localPort = localPort;
        this.destAddr = destAddr;
        this.destPort = destPort;
    }

    @Override
    public void run(){
        //
        try{
            this.localServer = new ServerSocket(this.localPort);
            this.isWorking = true;
        }catch (IOException e){
            e.printStackTrace();
        }
        //
        while(this.isWorking){
            try {
                Socket clientSocket = this.localServer.accept();
                new Thread(new TcpTunnel(clientSocket, destAddr, destPort)).start();
            }catch (IOException e){
                e.printStackTrace();
            }
        }
    }

    class UdpWorker implements Runnable{
        @Override
        public void run(){

        }
    }
}


class TcpTunnel implements Runnable {
    private String remoteHost;
    private int remotePort;
    private Socket clientSocket;
    private Socket destSocket;
    private boolean active = false;
    TcpTunnel(Socket clientSocket, String remoteHost, int remotePort){
        this.clientSocket = clientSocket;
        this.remotePort = remotePort;
        this.remoteHost = remoteHost;
    }
    @Override
    public void run(){
        try {
            destSocket = new Socket(remoteHost, remotePort);

            destSocket.setKeepAlive(true);
            clientSocket.setKeepAlive(true);

            InputStream clientIn = clientSocket.getInputStream();
            OutputStream clientOut = clientSocket.getOutputStream();
            InputStream destIn = destSocket.getInputStream();
            OutputStream destOut = destSocket.getOutputStream();

            active = true;
            new Thread(new TcpWorker(clientIn, destOut)).start();
            new Thread(new TcpWorker(destIn, clientOut)).start();

        }catch (IOException e){
            e.printStackTrace();
            return;
        }
    }


    class TcpWorker implements Runnable{
        private InputStream is;
        private OutputStream os;
        TcpWorker(InputStream is, OutputStream os){
            this.is = is;
            this.os = os;
        }
        @Override
        public void run(){
            byte[] buffer = new byte[32*1024];
            try {
                while (true) {
                    int bytesRead = is.read(buffer);
                    if (bytesRead == -1) break;
                    os.write(buffer, 0, bytesRead);
                    os.flush();
                }
            } catch (IOException e) {
                e.printStackTrace();
                // Read/write failed --> connection is broken
            }
        }
    }
}