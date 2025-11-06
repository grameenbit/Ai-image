export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:image/png;base64,xxxxxxxx..."
      // we only want the "xxxxxxxx..." part
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error("Failed to extract base64 string from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
