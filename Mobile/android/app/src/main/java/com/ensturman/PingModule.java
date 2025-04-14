package com.ensturman;

import android.os.AsyncTask;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

public class PingModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    PingModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "PingModule";
    }

    @ReactMethod
    public void pingHost(String host, Promise promise) {
        new PingTask(host, promise).execute();
    }

    private class PingTask extends AsyncTask<Void, Void, Map<String, Object>> {
        private String host;
        private Promise promise;

        PingTask(String host, Promise promise) {
            this.host = host;
            this.promise = promise;
        }

        @Override
        protected Map<String, Object> doInBackground(Void... params) {
            Map<String, Object> result = new HashMap<>();
            result.put("host", host);

            try {
                InetAddress address = InetAddress.getByName(host);
                result.put("ip", address.getHostAddress());

                long startTime = System.currentTimeMillis();
                boolean reachable = address.isReachable(5000);
                long endTime = System.currentTimeMillis();
                long pingTime = endTime - startTime;

                result.put("success", reachable);
                result.put("time", pingTime);
                result.put("reachable", reachable);

                return result;
            } catch (UnknownHostException e) {
                result.put("success", false);
                result.put("error", "Unknown host: " + e.getMessage());
                return result;
            } catch (IOException e) {
                result.put("success", false);
                result.put("error", "IO Error: " + e.getMessage());
                return result;
            }
        }

        @Override
        protected void onPostExecute(Map<String, Object> result) {
            promise.resolve(result);
        }
    }
} 