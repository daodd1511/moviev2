import { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CarouselComponent = () => {
  const test = 0;
  return (
    <Swiper
      slidesPerView={1}
      modules={[Navigation, Pagination]}
      navigation={true}
      pagination={{ clickable: true }}
      onSlideChange={() => console.log('slide change')}
      onSwiper={swiper => console.log(swiper)}
      className="h-carousel flex"
    >
      <SwiperSlide className="flex justify-center items-center">Slide 1</SwiperSlide>
      <SwiperSlide className="flex justify-center items-center">Slide 2</SwiperSlide>
      <SwiperSlide className="flex justify-center items-center">Slide 3</SwiperSlide>
      <SwiperSlide className="flex justify-center items-center">Slide 4</SwiperSlide>
    </Swiper>
  );
};

export const Carousel = memo(CarouselComponent);
