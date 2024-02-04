import './embla.css'

import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import imageByIndex from './imageByIndex'

type PropType = {
  slides: [string, string][]
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map(([name, link], index) => (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__number">
                <span>{index + 1}</span>
              </div>
              {name}
              <img
                className="embla__slide__img"
                src={imageByIndex(index)}
                alt={name}
              />
              {link}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
