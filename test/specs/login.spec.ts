import { $, browser } from '@wdio/globals';

describe('Login & Navigation Test', () => {
  before(async () => {
    await (browser as any).startActivity('com.huynhbao103.Bambon_Fe', 'com.huynhbao103.Bambon_Fe.MainActivity');
  });

  // after(async () => {
  //   await (browser as any).terminateApp('com.huynhbao103.Bambon_Fe');
  // });

  it('should navigate to first screen after clicking first "Tiếp tục"', async () => {
    const continueButton1 = await $('android=new UiSelector().description("Tiếp tục")');
    await continueButton1.waitForDisplayed({ timeout: 5000 });
    await continueButton1.click();

    const firstScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(5)');
    await firstScreen.waitForDisplayed({ timeout: 5000 });
    expect(await firstScreen.isDisplayed()).toBe(true);
  });

  it('should navigate to second screen after clicking second "Tiếp tục"', async () => {
    const continueButton2 = await $('android=new UiSelector().description("Tiếp tục")');
    await continueButton2.waitForDisplayed({ timeout: 5000 });
    await continueButton2.click();

    const secondScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(5)');
    await secondScreen.waitForDisplayed({ timeout: 5000 });
    expect(await secondScreen.isDisplayed()).toBe(true);
  });

  it('should show error when login with empty credentials', async () => {
    await $('~LOGIN').click();
    const errorMessage = await $('android=new UiSelector().className("android.widget.TextView").text("Vui lòng nhập email hợp lệ!")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Vui lòng nhập email hợp lệ!');
  });

  it('should login successfully with valid credentials', async () => {
    const emailInput = await $('android=new UiSelector().text("Email")');
    await emailInput.waitForDisplayed({ timeout: 5000 });
    await emailInput.setValue('abc160cba@gmail.com');

    const passwordInput = await $('android=new UiSelector().text("Password")');
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    await passwordInput.setValue('111111');

    await $('~LOGIN').click();

    const homeScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(10)');
    await homeScreen.waitForDisplayed({ timeout: 5000 });
    expect(await homeScreen.isDisplayed()).toBe(true);
  });
});
