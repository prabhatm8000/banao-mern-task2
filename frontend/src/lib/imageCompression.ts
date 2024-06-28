export const compressImage = async (files: FileList): Promise<FileList> => {
    const compressedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await resizeAndCompressImage(file);
        compressedFiles.push(compressedFile);
    }

    const dataTransfer = new DataTransfer();
    compressedFiles.forEach((file) => {
        dataTransfer.items.add(file);
    });

    return dataTransfer.files;
};

export const resizeAndCompressImage = async (files: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(files);
        reader.onload = (event) => {
            if (!event?.target?.result) {
                return;
            }

            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                const MAX_SIZE = 800;

                let width = image.width;
                let height = image.height;

                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // draw image with new dimensions
                context.drawImage(image, 0, 0, width, height);

                // canvas -> blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return;
                        }
                        const compressedFile = new File([blob], files.name, {
                            type: "image/png",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/png",
                    0.6
                );
            };

            reader.onerror = (error) => {
                reject(error);
            };

            image.src = event.target.result as string;
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
