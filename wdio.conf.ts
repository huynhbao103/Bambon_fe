export const config = {
    hostname: 'localhost',
    port: 4723,
    path: '/',
    runner: 'local',
    specs: ['./test/specs/**/*.ts'],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    reporters: ['spec'],
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:platformVersion': '11',
        'appium:app': 'D:\\DamBaoChatLuong\\25-3\\Bambon_1.1.0.apk',
        'appium:appPackage': 'com.huynhbao103.Bambon_Fe',
        'appium:appActivity': 'com.huynhbao103.Bambon_Fe.MainActivity',
        'appium:automationName': 'UiAutomator2',
        'appium:noReset': true,
        'appium:newCommandTimeout': 300,
    }],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
};
