// Mocks file storage operations for SANDBOX mode.
export const storageSandbox = {
  /**
   * Simulates uploading a file by creating a local object URL.
   * @param file The file to "upload".
   * @returns A promise that resolves with the object URL and file name.
   */
  uploadFile: async (file: File): Promise<{ url: string; name: string }> => {
    console.log(`🧱 SANDBOX: Simulating upload for file: ${file.name}`);
    const url = URL.createObjectURL(file);
    return Promise.resolve({ url, name: file.name });
  },

  /**
   * Simulates deleting a file. In the sandbox, this is a no-op
   * but will revoke an object URL if it was created by this service.
   * @param url The URL of the file to "delete".
   */
  deleteFile: async (url: string): Promise<void> => {
    console.log(`🧱 SANDBOX: Simulating delete for file URL: ${url}. (no-op)`);
    // Revoke the object URL to free up memory.
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
    return Promise.resolve();
  },
};
