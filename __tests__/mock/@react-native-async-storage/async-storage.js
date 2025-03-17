const mockAsyncStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    multiSet: jest.fn(),
    multiGet: jest.fn(),
    multiRemove: jest.fn(),
    flushGetRequests: jest.fn(),
  };
  
  export default mockAsyncStorage;