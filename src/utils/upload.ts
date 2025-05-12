const ENDPOINT = 'https://upload.moonchan.xyz/api/upload';

export function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(ENDPOINT, {
      method: 'PUT',
      body: file,
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then((data) => {
      resolve(`https://upload.moonchan.xyz/api/${data.id}/${file.name}`);
    }).catch((error) => {
      reject(error);
    });
  });
}