package com.ensturman;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactPackage;
import java.util.List;

public class MainApplication extends Application {

  @Override
  protected List<ReactPackage> getPackages() {
    @SuppressWarnings("UnnecessaryLocalVariable")
    List<ReactPackage> packages = new PackageList(this).getPackages();
    // Packages that cannot be autolinked yet can be added manually here
    packages.add(new PingPackage());
    return packages;
  }
} 