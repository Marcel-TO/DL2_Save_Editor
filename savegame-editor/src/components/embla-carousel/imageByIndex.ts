import image1 from '../../assets/pictures/slider-1.jpg'
import image2 from '../../assets/pictures/slider-2.jpg'
import image3 from '../../assets/pictures/slider-3.jpg'

export const images: string[] = [image1, image2, image3]

const imageByIndex = (index: number): string => images[index % images.length]

export default imageByIndex
