import image1 from '../../assets/pictures/slider-1.jpg'
import image2 from '../../assets/pictures/slider-2.jpg'
import image3 from '../../assets/pictures/slider-3.jpg'
import image6 from '../../assets/pictures/slider-6.jpg'
import image7 from '../../assets/pictures/slider-7.jpg'


export const images: string[] = [image1, image2, image3, image6, image7]

const imageByIndex = (index: number): string => images[index % images.length]

export default imageByIndex
