// selective-exif-remover.js - Выборочное удаление EXIF с помощью piexifjs

class SelectiveExifRemover {
    constructor() {
        this.exifObj = null;
    }

    // Чтение EXIF из изображения
    async readExif(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const dataUrl = e.target.result;
                    const exifObj = piexif.load(dataUrl);
                    resolve(exifObj);
                } catch (error) {
                    // Если нет EXIF данных
                    resolve({});
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsDataURL(file);
        });
    }

    // Удаление выбранных метаданных
    async removeSelectedMetadata(file, selectedCategories = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    try {
                        const dataUrl = e.target.result;
                        let exifObj = {};
                        
                        try {
                            exifObj = piexif.load(dataUrl);
                        } catch (err) {
                            // Нет EXIF данных - используем Canvas
                            const canvasResult = await this.fallbackToCanvas(file);
                            resolve(canvasResult);
                            return;
                        }

                        // Создаем новый объект EXIF, копируя только то, что НЕ выбрано для удаления
                        const newExifObj = this.filterExif(exifObj, selectedCategories);

                        // Конвертируем обратно в binary
                        const exifBytes = piexif.dump(newExifObj);

                        // Вставляем EXIF обратно в изображение
                        const newDataUrl = piexif.insert(exifBytes, dataUrl);

                        // Конвертируем в blob
                        const blob = this.dataURLtoBlob(newDataUrl);

                        resolve({
                            success: true,
                            originalName: file.name,
                            cleanFileName: this.getCleanFileName(file.name),
                            originalSize: file.size,
                            cleanSize: blob.size,
                            blob: blob,
                            metadataRemoved: selectedCategories
                        });

                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = () => reject(new Error('Ошибка чтения файла'));
                reader.readAsDataURL(file);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Фильтрация EXIF по выбранным категориям
    filterExif(exifObj, selectedCategories) {
        const newExifObj = {
            "0th": {},
            "Exif": {},
            "GPS": {},
            "Interop": {},
            "1st": {},
            "thumbnail": null
        };

        // Если выбрано "location" (GPS) - удаляем все GPS данные
        if (!selectedCategories.includes('location')) {
            // Копируем GPS если не удаляем
            if (exifObj.GPS) {
                newExifObj.GPS = { ...exifObj.GPS };
            }
        }

        // Если выбрано "camera" - удаляем Make, Model и связанные теги
        const cameraTagsToRemove = [
            piexif.ImageIFD.Make,
            piexif.ImageIFD.Model,
            piexif.ExifIFD.LensModel,
            piexif.ImageIFD.Software
        ];

        // Копируем 0th (основные теги)
        if (exifObj["0th"]) {
            newExifObj["0th"] = { ...exifObj["0th"] };
            if (selectedCategories.includes('camera')) {
                cameraTagsToRemove.forEach(tag => {
                    delete newExifObj["0th"][tag];
                });
            }
        }

        // Если выбрано "datetime" - удаляем даты
        const dateTagsToRemove = [
            piexif.ImageIFD.DateTime,
            piexif.ExifIFD.DateTimeOriginal,
            piexif.ExifIFD.DateTimeDigitized
        ];

        // Копируем Exif теги
        if (exifObj.Exif) {
            newExifObj.Exif = { ...exifObj.Exif };
            
            if (selectedCategories.includes('datetime')) {
                dateTagsToRemove.forEach(tag => {
                    delete newExifObj["0th"][tag];
                    delete newExifObj.Exif[tag];
                });
            }

            if (selectedCategories.includes('camera')) {
                delete newExifObj.Exif[piexif.ExifIFD.LensModel];
            }

            // Если выбрано "technical" - удаляем технические параметры
            if (selectedCategories.includes('technical')) {
                const technicalTags = [
                    piexif.ExifIFD.ExposureTime,
                    piexif.ExifIFD.FNumber,
                    piexif.ExifIFD.ISOSpeedRatings,
                    piexif.ExifIFD.FocalLength,
                    piexif.ExifIFD.WhiteBalance,
                    piexif.ExifIFD.Flash
                ];
                technicalTags.forEach(tag => {
                    delete newExifObj.Exif[tag];
                });
            }
        }

        // Если выбрано "other" - удаляем прочие данные
        if (selectedCategories.includes('other')) {
            delete newExifObj["0th"][piexif.ImageIFD.Copyright];
            delete newExifObj["0th"][piexif.ImageIFD.Artist];
            delete newExifObj["0th"][piexif.ImageIFD.Orientation];
            delete newExifObj["0th"][piexif.ImageIFD.XResolution];
            delete newExifObj["0th"][piexif.ImageIFD.YResolution];
        }

        // Копируем Interop если есть
        if (exifObj.Interop) {
            newExifObj.Interop = { ...exifObj.Interop };
        }

        return newExifObj;
    }

    // Fallback к Canvas если piexif не работает
    async fallbackToCanvas(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        resolve({
                            success: true,
                            originalName: file.name,
                            cleanFileName: this.getCleanFileName(file.name),
                            originalSize: file.size,
                            cleanSize: blob.size,
                            blob: blob,
                            metadataRemoved: ['Все метаданные (fallback)']
                        });
                    }, 'image/jpeg', 0.95);
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }

    // Конвертация DataURL в Blob
    dataURLtoBlob(dataURL) {
        const parts = dataURL.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeString });
    }

    // Получить чистое имя файла
    getCleanFileName(originalName) {
        const nameParts = originalName.split('.');
        const extension = nameParts.pop();
        const baseName = nameParts.join('.');
        return `${baseName}_clean.jpg`;
    }

    // Скачать файл
    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectiveExifRemover;
}
