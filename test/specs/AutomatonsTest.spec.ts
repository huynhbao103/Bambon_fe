import { $, browser } from '@wdio/globals';
import { remote } from 'webdriverio';

describe('Login', () => {
  before(async () => {
    await (browser as any).startActivity('com.huynhbao103.Bambon_Fe', 'com.huynhbao103.Bambon_Fe.MainActivity');
  });

  // after(async () => { 
  //   await (browser as any).terminateApp('com.huynhbao103.Bambon_Fe');
  // });

  async function clearInputFields() {
    const emailInput = await $('android=new UiSelector().resourceId("email")');
    const passwordInput = await $('android=new UiSelector().resourceId("password")');
  
    await emailInput.waitForDisplayed({ timeout: 5000 });
    await emailInput.click(); 
    await emailInput.clearValue();
    await emailInput.setValue(''); 
  
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    await passwordInput.click();
    await passwordInput.clearValue();
    await passwordInput.setValue('');
  }

  it('Chuyển đến màn hình đầu tiên khi nhấn "Tiếp tục" lần đầu', async () => {
    const continueButton1 = await $('android=new UiSelector().description("Tiếp tục")');
    await continueButton1.waitForDisplayed({ timeout: 5000 });
    await continueButton1.click();

    const firstScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(5)');
    await firstScreen.waitForDisplayed({ timeout: 5000 });
    expect(await firstScreen.isDisplayed()).toBe(true);
  });

  it('Chuyển đến màn hình thứ hai khi nhấn "Tiếp tục" lần hai', async () => {
    const continueButton2 = await $('android=new UiSelector().description("Tiếp tục")');
    await continueButton2.waitForDisplayed({ timeout: 5000 });
    await continueButton2.click();

    const secondScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(5)');
    await secondScreen.waitForDisplayed({ timeout: 5000 });
    expect(await secondScreen.isDisplayed()).toBe(true);
  });

  it('Hiển thị lỗi khi đăng nhập với thông tin trống', async () => {
    await $('~LOGIN').click();
    const errorMessage = await $('android=new UiSelector().className("android.widget.TextView").text("Vui lòng nhập email hợp lệ!")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Vui lòng nhập email hợp lệ!');
  });

  it('Hiển thị lỗi khi nhập sai định dạng email', async () => {
    const emailInput = await $('android=new UiSelector().resourceId("email")');
    await emailInput.waitForDisplayed({ timeout: 5000 });
    await emailInput.setValue('invalidemail');
    await $('~LOGIN').click();

    const errorMessage = await $('android=new UiSelector().text("Vui lòng nhập email hợp lệ!")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.isDisplayed()).toBe(true);

    await emailInput.setValue('');
  });

  it('Hiển thị lỗi khi mật khẩu quá ngắn', async () => {
    const emailInput = await $('android=new UiSelector().resourceId("email")');
    await emailInput.waitForDisplayed({ timeout: 5000 });
    await emailInput.setValue('abc160cba@gmail.com');

    const passwordInput = await $('android=new UiSelector().resourceId("password")');
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    await passwordInput.setValue('123');

    await $('~LOGIN').click();

    const errorMessage = await $('android=new UiSelector().resourceId("errorMessage")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.isDisplayed()).toBe(true);

    await clearInputFields();
  });

  it('Đăng nhập thành công với thông tin hợp lệ', async () => {
    const emailInput = await $('android=new UiSelector().resourceId("email")');
    await emailInput.waitForDisplayed({ timeout: 5000 });
    await emailInput.setValue('abc160cba@gmail.com');

    const passwordInput = await $('android=new UiSelector().resourceId("password")');
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    await passwordInput.setValue('111111');

    await $('~LOGIN').click();

    const homeScreen = await $('android=new UiSelector().className("android.view.ViewGroup").instance(10)');
    await homeScreen.waitForDisplayed({ timeout: 5000 });
    expect(await homeScreen.isDisplayed()).toBe(true);
  });
});
describe('OCR- Check Navigation', () => {
  it('Kiểm tra xem thanh navigation có hiển thị không', async () => {
      const navigationBar = await $('android=new UiSelector().className("android.view.ViewGroup").instance(27)');
      await navigationBar.waitForDisplayed({ timeout: 5000 });

      expect(await navigationBar.isDisplayed()).toBe(true);
  });
  it('Tìm và nhấn vào nút Quét trong Navigation', async () => {
    const scanButton = await $('android=new UiSelector().description(", Quét")');
    await scanButton.waitForDisplayed({ timeout: 5000 });

    expect(await scanButton.isDisplayed()).toBe(true);
    await scanButton.click();
  });

  it('Tìm và nhấp vào nút thêm Hình ảnh', async () => {
    const chooseImage = await $('android=new UiSelector().resourceId("pick-image-button")');
    await chooseImage.waitForDisplayed({ timeout: 5000 });

    expect(await chooseImage.isDisplayed()).toBe(true);
    await chooseImage.click();
  });
  it('Kiểm tra màn hình chọn ảnh = true -> chọn ảnh', async () => {
    const screen = await $('android=new UiSelector().resourceId("com.google.android.documentsui:id/dir_list")');
    await screen.waitForDisplayed({ timeout: 5000 });

    if (await screen.isDisplayed()) {
        const imageElement = await $('android=new UiSelector().resourceId("com.google.android.documentsui:id/icon_thumb").instance(9)');
        await imageElement.click();
    }
  });
  it('Nhấp vào nút Crop sau khi chọn ảnh', async () => {
    const cropButton = await $('android=new UiSelector().resourceId("com.huynhbao103.Bambon_Fe:id/crop_image_menu_crop")');

    await cropButton.waitForDisplayed({ timeout: 5000 });
    await cropButton.click();
  });
  it('Chọn xác nhận', async () => {
    await browser.pause(5000); 

    const targetElement = await $('android=new UiSelector().resourceId("confirm-photo-button")');

    await targetElement.waitForDisplayed({ timeout: 30000, interval: 1000 }); 

    expect(await targetElement.isDisplayed()).toBe(true);
    await targetElement.click();
  });
  it('Chờ màn hình xuất hiện rồi chọn nút OK', async () => {
    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');

    await confirmButton.waitForExist({ timeout: 60000 });
  
    if (await confirmButton.isDisplayed()) {
      await confirmButton.click();
    } else {
      throw new Error('Nút OK không hiển thị');
    }
  });
});
describe('addTransaction Income', () => {
  it('Kiểm tra xem thanh navigation có hiển thị không', async () => {
    const navigationBar = await $('android=new UiSelector().className("android.view.ViewGroup").instance(17)');
    await navigationBar.waitForDisplayed({ timeout: 5000 });

    expect(await navigationBar.isDisplayed()).toBe(true);
  });
  it("Tìm và nhấn vào nút nhập", async () => {
    const incomeButton = await $('android=new UiSelector().description(", Nhập")');
    await incomeButton.waitForDisplayed({ timeout: 5000 });

    expect(await incomeButton.isDisplayed()).toBe(true);
    await incomeButton.click();
  });
  it("Tìm và nhấn vào nút Thu nhập", async () => {
    const incomeButton = await $('android=new UiSelector().resourceId("transaction-type-income")');
    await incomeButton.waitForDisplayed({ timeout: 5000 });

    expect(await incomeButton.isDisplayed()).toBe(true);
    await incomeButton.click();
  });
  it('Nhấp mà không chọn danh mục', async () => {
    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();

    expect(await submitButton.isDisplayed()).toBe(false);
    
    const frameLayout = await $('android=new UiSelector().className("android.widget.FrameLayout").instance(0)');
    await frameLayout.waitForDisplayed({ timeout: 5000 });
    expect(await frameLayout.isDisplayed()).toBe(true);

    const errorMessage = await $('android=new UiSelector().resourceId("android:id/message")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Vui lòng chọn danh mục.');

    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');
    await confirmButton.waitForExist({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();
  });

  it("Tìm và nhấn vào nút Thêm mới", async () => {
    const addButton = await $('android=new UiSelector().resourceId("add-custom-category-button")');
    await addButton.waitForDisplayed({ timeout: 5000 });
  
    expect(await addButton.isDisplayed()).toBe(true);
    await addButton.click();
  });
  it("Nhập danh mục mới, xác nhận và chọn danh mục", async () => {
    const categoryInput = await $('android=new UiSelector().text("Nhập danh mục mới")');
    await categoryInput.waitForDisplayed({ timeout: 5000 });

    expect(await categoryInput.isDisplayed()).toBe(true);
    await categoryInput.setValue("phake0");

    const confirmButton = await $('android=new UiSelector().resourceId("confirm-add-category-button")');
    await confirmButton.waitForDisplayed({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();

    const newCategory = await $('android=new UiSelector().description(", phake0")');
    await newCategory.waitForDisplayed({ timeout: 5000 });

    expect(await newCategory.isDisplayed()).toBe(true);

    await newCategory.click();
  });

  it('Nhập số tiền và gửi giao dịch', async () => {
    const amountInput = await $('android=new UiSelector().text("Nhập số tiền")');
    await amountInput.waitForDisplayed({ timeout: 5000 });

    await amountInput.setValue('100000');

    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();

    expect(await submitButton.isDisplayed()).toBe(false); 
  });
  it('Kiểm tra FrameLayout và nhấn nút xác nhận', async () => {
    const frameLayout = await $('android=new UiSelector().className("android.widget.FrameLayout").instance(0)');
    await frameLayout.waitForDisplayed({ timeout: 5000 });
    expect(await frameLayout.isDisplayed()).toBe(true);

    const errorMessage = await $('android=new UiSelector().resourceId("android:id/message")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Giao dịch đã được thêm thành công!');

    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');
    await confirmButton.waitForExist({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();
  });
});
describe('addTransaction Expense', () => {
  it("Tìm và nhấn vào nút Chi tiêu", async () => {
    const expenseButton = await $('android=new UiSelector().resourceId("transaction-type-expense")');
    await expenseButton.waitForDisplayed({ timeout: 5000 });

    expect(await expenseButton.isDisplayed()).toBe(true);
    await expenseButton.click();
  });
  it('Nhấp mà không chọn danh mục', async () => {
    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();

    expect(await submitButton.isDisplayed()).toBe(false);
    
    const frameLayout = await $('android=new UiSelector().className("android.widget.FrameLayout").instance(0)');
    await frameLayout.waitForDisplayed({ timeout: 5000 });
    expect(await frameLayout.isDisplayed()).toBe(true);

    const errorMessage = await $('android=new UiSelector().resourceId("android:id/message")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Vui lòng chọn danh mục.');

    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');
    await confirmButton.waitForExist({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();
  });
  it('Chọn danh mục ăn uống và gửi giao dịch', async () => {
    const categoryType = await $('android=new UiSelector().description(", Ăn uống")');
    await categoryType.waitForDisplayed({ timeout: 5000 });
    await categoryType.click();

    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();

    expect(await submitButton.isDisplayed()).toBe(false);
    
    const errorMessage = await $('android=new UiSelector().resourceId("android:id/message")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Vui lòng thêm ít nhất một mục chi tiêu.');

    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');
    await confirmButton.waitForExist({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();
  });
  it("Tìm và nhấn vào nút Thêm mới -> Nhập danh mục mới, xác nhận và chọn danh mục", async () => {
    const addButton = await $('android=new UiSelector().resourceId("add-custom-category-button")');
    await addButton.waitForDisplayed({ timeout: 5000 });
  
    expect(await addButton.isDisplayed()).toBe(true);
    await addButton.click();

    const categoryInput = await $('android=new UiSelector().text("Nhập danh mục mới")');
    await categoryInput.waitForDisplayed({ timeout: 5000 });

    expect(await categoryInput.isDisplayed()).toBe(true);
    await categoryInput.setValue("phake01");

    const confirmButton = await $('android=new UiSelector().resourceId("confirm-add-category-button")');
    await confirmButton.waitForDisplayed({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();

    const newCategory = await $('android=new UiSelector().description(", phake01")');
    await newCategory.waitForDisplayed({ timeout: 5000 });

    expect(await newCategory.isDisplayed()).toBe(true);
    await newCategory.click();

    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();
  });
  it("Tìm và nhấn vào nút Thêm mục -> Nhập mục mới", async () => {
    const addButton = await $('android=new UiSelector().resourceId("add-item-button")');
    await addButton.waitForDisplayed({ timeout: 5000 });

    const itemInputName = await $('android=new UiSelector().text("VD: Cà phê").instance(0)');
    await itemInputName.waitForDisplayed({ timeout: 5000 });

    expect(await itemInputName.isDisplayed()).toBe(true);
    await itemInputName.setValue("phake01");

    const itemInputQuantity = await $('android=new UiSelector().text("VD: 2").instance(0)');
    await itemInputQuantity.waitForDisplayed({ timeout: 5000 });

    expect(await itemInputQuantity.isDisplayed()).toBe(true);
    await itemInputQuantity.setValue("2");

    const itemInputPrice = await $('android=new UiSelector().text("VD: 25000").instance(0)');
    await itemInputPrice.waitForDisplayed({ timeout: 5000 });

    expect(await itemInputPrice.isDisplayed()).toBe(true);
    await itemInputPrice.setValue("25000");

    const submitButton = await $('android=new UiSelector().resourceId("submit-transaction-button")');
    await submitButton.waitForDisplayed({ timeout: 5000 });
    await submitButton.click();

    const errorMessage = await $('android=new UiSelector().resourceId("android:id/message")');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    expect(await errorMessage.getText()).toBe('Giao dịch đã được thêm thành công!');

    const confirmButton = await $('android=new UiSelector().resourceId("android:id/button1")');
    await confirmButton.waitForExist({ timeout: 5000 });
    expect(await confirmButton.isDisplayed()).toBe(true);
    await confirmButton.click();
  });
});