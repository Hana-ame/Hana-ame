const ENDPOINT = 'https://chat.moonchan.xyz/api/files/upload';

export function uploadfile(file: File): Promise<string> {
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
      resolve(`https://chat.moonchan.xyz/api/files/${data.id}/${file.name}`);
    }).catch((error) => {
      reject(error);
    });
  });
}