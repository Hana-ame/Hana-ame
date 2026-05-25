package top.hana_sweet.portforwarder;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;

public class MainActivity extends AppCompatActivity {
    final String msg = "调试";

    // textviews
    private TextView tvbg;
    private TextView tv0;
    private TextView tv1;
    private TextView tv2;
    // 本地端口

    /**
     * 当活动第一次被创建时调用
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "TODO: 增加转发条目", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });
        // TextView绑定
        tvbg = findViewById(R.id.bg);
        tv0 = findViewById(R.id.editText);
        tv1 = findViewById(R.id.editTextTcp1);
        tv2 = findViewById(R.id.editTextTcp2);

//        tvbg.append("\n" + "2105031706");
        tvbg.append("\n" + "2105211613");

//        new Thread(new UdpForwarder(3389,"192.168.42.1",3389)).start();
        // 会OnCreat
        Intent intent = new Intent(this,PFService.class);
        startService(intent);

        Log.d(msg, "The onCreate() event");
    }
    // 点击按钮事件
    public void startForwarding(View view) {
//        Log.d(msg, );
        switch (view.getId()) {
            case R.id.startForwarding:
                String text = "";
                text += tv0.getText().toString();
                text += tv1.getText().toString();
                text += tv2.getText().toString();

                Snackbar.make(view, text, Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
                break;
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }


}
/*
class UdpForwarder implements Runnable{
    private int localPort;
    private String destAddr;
    private int destPort;
    private DatagramSocket localServer;
    private DatagramSocket destSocket;
//    private DatagramPacket dataGramPacket;
    private boolean isWorking = false;


    UdpForwarder(int localPort, String destAddr, int destPort){
        this.localPort = localPort;
        this.destAddr = destAddr;
        this.destPort = destPort;
    }

    @Override
    public void run(){
        //
        try{
            localServer = new DatagramSocket(localPort);
            destSocket = new DatagramSocket();
            isWorking = true;
//            DatagramPacket dataGramPacket = new DatagramPacket(new byte[32*1024],32*1024);
        }catch (IOException e){
            e.printStackTrace();
            destSocket.close();
        }
        //
        try {
            while(isWorking){
                byte[] buf = new byte[32*1024];
                DatagramPacket packet = new DatagramPacket(buf, buf.length);
                localServer.receive(packet);

                InetAddress address = packet.getAddress();
                int port = packet.getPort();
                packet = new DatagramPacket(buf, buf.length, address, port);
//            new Thread(new UdpTunnel(localServer, destSocket)).start();
//            new Thread(new UdpTunnel(localServer, destSocket)).start();
            }
        }catch (IOException e){
            e.printStackTrace();
        }

    }

    class UdpTunnel implements Runnable{
        private DatagramSocket recv;
        private DatagramSocket send;
        UdpTunnel(DatagramSocket recv, DatagramSocket send){
            this.recv = recv;
            this.send = send;
        }
        @Override
        public void run(){
            DatagramPacket packet = new DatagramPacket(new byte[32*1024], 32*1024);
            try {
                while(true){
                    if (recv.isClosed()) {return;}
                    recv.receive(packet);

                }
            }catch (IOException e){
                e.printStackTrace();
            }
        }
    }
}
*/


//        https://i.ibb.co/mh0W4M0/tumblr-nuzc04-CUCP1tgchvoo1-640.webp
/*

class ServerThread implements Runnable  {
    private ServerSocket server;
    private int localPort;
    private int destPort;
    private String destAddr;
    private final int TIMEOUT;
    {
        server = null;
        localPort = 3389;
        destPort = 3389;
        destAddr = "192.168.42.189";
        TIMEOUT = 30;
    }

    @Override
    public void run() {
        // 开启服务
        try {
            this.server = new ServerSocket(this.localPort);
            Log.d("aaa","服务开启");
        }catch (IOException e){
            e.printStackTrace();
        }
        //
        while (true) {
            Socket socketIN = null;
            Socket socketOut = null;
            try {
                Log.d("aaa","before accept()");
                socketIN = server.accept();
                Log.d("aaa","SocketIN");
                // 建立与目标主机的连接
                socketOut = new Socket(this.destAddr, this.destPort);
                Log.d("aaa","SocketOut");
                // 端口转发
                new Thread(new Switch(socketIN, socketOut, socketOut.getInputStream(), socketIN.getOutputStream())).start();
                new Thread(new Switch(socketIN, socketOut, socketIN.getInputStream(), socketOut.getOutputStream())).start();
            } catch (IOException e) {
                e.printStackTrace();
                close(socketIN);
                close(socketOut);
            }
        }
    }

    private class Switch implements Runnable {
        private Socket host;
        private Socket remoteHost;
        private InputStream in;
        private OutputStream out;

        Switch(Socket host, Socket remoteHost, InputStream in, OutputStream out) {
            this.host = host;
            this.remoteHost = remoteHost;
            this.in = in;
            this.out = out;
        }

        @Override
        public void run() {
            Log.d("aaa","in Switch");
            int length = 0;
            byte[] buffer = new byte[1024*32];
            try {
                while (!host.isClosed() && (length = in.read(buffer)) > -1) {
                    out.write(buffer, 0, length);
                }
            } catch (IOException e) {
                Log.d("转发","连接关闭");
            } finally {
                close(host);
                close(remoteHost);
            }
        }
    }
    void close(Socket socket) {
        try {
            if (socket != null) {
                socket.close();
                Log.d("aaa","close");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


    // 当活动即将可见时调用
    @Override
    protected void onStart() {
        super.onStart();
        Log.d(msg, "The onStart() event");
    }

    // 当活动可见时调用
    @Override
    protected void onResume() {
        super.onResume();
        Log.d(msg, "The onResume() event");
    }

    // 当其他活动获得焦点时调用
    @Override
    protected void onPause() {
        super.onPause();
        Log.d(msg, "The onPause() event");
    }

    // 当活动不再可见时调用
    @Override
    protected void onStop() {
        super.onStop();
        Log.d(msg, "The onStop() event");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(msg, "The onRestart() event");
    }

    // 当活动将被销毁时调用
    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(msg, "The onDestroy() event");
    }
}
*/