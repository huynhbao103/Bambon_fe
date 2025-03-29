export const config = {
    runner: 'local',
    framework: 'mocha',
    sync: true,
    reporters: ['spec'],
    services: ['appium'],
    appium: {
        command: 'appium',
        args: ['--use-legacy-sessions'],
    },
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:platformVersion': '11', // Phiên bản Android
        'appium:app': 'D:\\DamBaoChatLuong\\25-3\\Bambon.apk',
        'appium:appPackage': 'com.huynhbao103.Bambon_Fe',
        'appium:appActivity': 'com.huynhbao103.Bambon_Fe.MainActivity',
        'appium:noReset': true,
        'appium:newCommandTimeout': 300,
        'appium:automationName': 'UiAutomator2', // Đảm bảo sử dụng UiAutomator2
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:4723', // Đảm bảo Appium server đang chạy tại đây
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
};
