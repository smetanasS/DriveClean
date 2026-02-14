// exif-reader.js - EXIF metadata reader using exif-js library

class ExifReader {
    constructor() {
        this.metadata = {};
    }

    // Чтение метаданных из файла
    async readMetadata(file) {
        return new Promise((resolve, reject) => {
            if (typeof EXIF === 'undefined') {
                reject(new Error('Библиотека EXIF.js не загружена'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    try {
                        EXIF.getData(img, () => {
                            const allTags = EXIF.getAllTags(img);
                            const metadata = this.parseMetadata(allTags);
                            resolve(metadata);
                        });
                    } catch (error) {
                        // Если нет метаданных, возвращаем пустой объект
                        resolve({
                            hasMetadata: false,
                            categories: {}
                        });
                    }
                };

                img.onerror = () => {
                    reject(new Error('Ошибка загрузки изображения'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Ошибка чтения файла'));
            };

            reader.readAsDataURL(file);
        });
    }

    // Парсинг метаданных по категориям
    parseMetadata(tags) {
        const metadata = {
            hasMetadata: Object.keys(tags).length > 0,
            categories: {
                location: [],
                camera: [],
                datetime: [],
                technical: [],
                other: []
            }
        };

        // Геолокация
        if (tags.GPSLatitude || tags.GPSLongitude) {
            metadata.categories.location.push({
                key: 'GPS Location',
                value: this.formatGPS(tags),
                tag: 'GPS',
                critical: true
            });
        }

        if (tags.GPSLatitude) {
            metadata.categories.location.push({
                key: 'GPS Latitude',
                value: this.formatCoordinate(tags.GPSLatitude, tags.GPSLatitudeRef),
                tag: 'GPS',
                critical: true
            });
        }

        if (tags.GPSLongitude) {
            metadata.categories.location.push({
                key: 'GPS Longitude',
                value: this.formatCoordinate(tags.GPSLongitude, tags.GPSLongitudeRef),
                tag: 'GPS',
                critical: true
            });
        }

        if (tags.GPSAltitude) {
            metadata.categories.location.push({
                key: 'GPS Altitude',
                value: tags.GPSAltitude + 'm',
                tag: 'GPS',
                critical: false
            });
        }

        // Информация о камере
        if (tags.Make) {
            metadata.categories.camera.push({
                key: 'Camera Make',
                value: tags.Make,
                tag: 'EXIF',
                critical: true
            });
        }

        if (tags.Model) {
            metadata.categories.camera.push({
                key: 'Camera Model',
                value: tags.Model,
                tag: 'EXIF',
                critical: true
            });
        }

        if (tags.LensModel) {
            metadata.categories.camera.push({
                key: 'Lens Model',
                value: tags.LensModel,
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.Software) {
            metadata.categories.camera.push({
                key: 'Software',
                value: tags.Software,
                tag: 'EXIF',
                critical: false
            });
        }

        // Дата и время
        if (tags.DateTime) {
            metadata.categories.datetime.push({
                key: 'Date/Time',
                value: tags.DateTime,
                tag: 'EXIF',
                critical: true
            });
        }

        if (tags.DateTimeOriginal) {
            metadata.categories.datetime.push({
                key: 'Date/Time Original',
                value: tags.DateTimeOriginal,
                tag: 'EXIF',
                critical: true
            });
        }

        if (tags.DateTimeDigitized) {
            metadata.categories.datetime.push({
                key: 'Date/Time Digitized',
                value: tags.DateTimeDigitized,
                tag: 'EXIF',
                critical: false
            });
        }

        // Технические параметры
        if (tags.ExposureTime) {
            metadata.categories.technical.push({
                key: 'Exposure Time',
                value: this.formatExposureTime(tags.ExposureTime),
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.FNumber) {
            metadata.categories.technical.push({
                key: 'F-Number',
                value: 'f/' + tags.FNumber,
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.ISO || tags.ISOSpeedRatings) {
            metadata.categories.technical.push({
                key: 'ISO',
                value: tags.ISO || tags.ISOSpeedRatings,
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.FocalLength) {
            metadata.categories.technical.push({
                key: 'Focal Length',
                value: tags.FocalLength + 'mm',
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.WhiteBalance) {
            metadata.categories.technical.push({
                key: 'White Balance',
                value: tags.WhiteBalance === 0 ? 'Auto' : 'Manual',
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.Flash) {
            metadata.categories.technical.push({
                key: 'Flash',
                value: this.formatFlash(tags.Flash),
                tag: 'EXIF',
                critical: false
            });
        }

        // Другие метаданные
        if (tags.Orientation) {
            metadata.categories.other.push({
                key: 'Orientation',
                value: this.formatOrientation(tags.Orientation),
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.XResolution) {
            metadata.categories.other.push({
                key: 'X Resolution',
                value: tags.XResolution,
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.YResolution) {
            metadata.categories.other.push({
                key: 'Y Resolution',
                value: tags.YResolution,
                tag: 'EXIF',
                critical: false
            });
        }

        if (tags.Copyright) {
            metadata.categories.other.push({
                key: 'Copyright',
                value: tags.Copyright,
                tag: 'IPTC',
                critical: false
            });
        }

        if (tags.Artist) {
            metadata.categories.other.push({
                key: 'Artist',
                value: tags.Artist,
                tag: 'EXIF',
                critical: false
            });
        }

        return metadata;
    }

    // Форматирование GPS координат
    formatGPS(tags) {
        if (!tags.GPSLatitude || !tags.GPSLongitude) return 'N/A';

        const lat = this.formatCoordinate(tags.GPSLatitude, tags.GPSLatitudeRef);
        const lon = this.formatCoordinate(tags.GPSLongitude, tags.GPSLongitudeRef);

        return `${lat}, ${lon}`;
    }

    formatCoordinate(coord, ref) {
        if (!coord || coord.length < 3) return 'N/A';

        const degrees = coord[0];
        const minutes = coord[1];
        const seconds = coord[2];

        const decimal = degrees + (minutes / 60) + (seconds / 3600);
        return `${decimal.toFixed(6)}° ${ref || ''}`;
    }

    formatExposureTime(time) {
        if (time < 1) {
            return `1/${Math.round(1 / time)}s`;
        }
        return `${time}s`;
    }

    formatFlash(flash) {
        const flashModes = {
            0: 'No Flash',
            1: 'Flash Fired',
            5: 'Flash Fired, Return Not Detected',
            7: 'Flash Fired, Return Detected',
            9: 'Flash Fired, Compulsory',
            13: 'Flash Fired, Compulsory, Return Not Detected',
            15: 'Flash Fired, Compulsory, Return Detected',
            16: 'No Flash, Compulsory',
            24: 'No Flash, Auto',
            25: 'Flash Fired, Auto',
            29: 'Flash Fired, Auto, Return Not Detected',
            31: 'Flash Fired, Auto, Return Detected'
        };
        return flashModes[flash] || `Unknown (${flash})`;
    }

    formatOrientation(orientation) {
        const orientations = {
            1: 'Normal',
            2: 'Flip Horizontal',
            3: 'Rotate 180°',
            4: 'Flip Vertical',
            5: 'Transpose',
            6: 'Rotate 90° CW',
            7: 'Transverse',
            8: 'Rotate 270° CW'
        };
        return orientations[orientation] || `Unknown (${orientation})`;
    }

    // Получить список категорий с данными
    getCategoriesWithData(metadata) {
        const categories = [];

        if (metadata.categories.location.length > 0) {
            categories.push({ name: 'location', label: '📍 Геолокация', count: metadata.categories.location.length });
        }
        if (metadata.categories.camera.length > 0) {
            categories.push({ name: 'camera', label: '📷 Камера', count: metadata.categories.camera.length });
        }
        if (metadata.categories.datetime.length > 0) {
            categories.push({ name: 'datetime', label: '🕐 Дата и время', count: metadata.categories.datetime.length });
        }
        if (metadata.categories.technical.length > 0) {
            categories.push({ name: 'technical', label: '⚙️ Технические параметры', count: metadata.categories.technical.length });
        }
        if (metadata.categories.other.length > 0) {
            categories.push({ name: 'other', label: '📝 Прочее', count: metadata.categories.other.length });
        }

        return categories;
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExifReader;
}
