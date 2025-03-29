export default jest.fn((uri: string, userId: string) => {
  return Promise.resolve({
    data: {
      type: 'expense',
      category: 'food',
      items: [{ productName: 'Mock Item', quantity: 1, price: 100000 }],
      amount: 100000
    },
    imageUrl: 'http://example.com/mock-image.jpg'
  });
});