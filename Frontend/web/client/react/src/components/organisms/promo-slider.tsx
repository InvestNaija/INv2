import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import CircularProgress from "@mui/material/CircularProgress";
import { useHomeFeatures } from "../../contexts/homeContext";

// Showcases the new-products feed (same data as the "Explore Investments"
// list on Overview) as a swipeable carousel, using each product's own promo
// image as the slide background.
const PromoSlider = () => {
  const { newProducts, isLoading } = useHomeFeatures();

  // Fixed, compact height (not the image's natural aspect ratio) so the
  // carousel reads as a slim banner strip rather than a tall block that
  // pushes the rest of the dashboard down.
  const SLIDE_HEIGHT = "h-[110px] sm:h-[130px]";

  if (isLoading) {
    return (
      <div
        className={`${SLIDE_HEIGHT} border border-[#F4F4F4] rounded-[20px] bg-[#F0F0F0] animate-pulse`}
      />
    );
  }

  if (!newProducts || newProducts.length === 0) {
    return null;
  }

  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={newProducts && newProducts.length > 1}
      className={`promo-slider ${SLIDE_HEIGHT} rounded-[20px]`}
    >
      {newProducts?.map((product) => (
        <SwiperSlide key={product.id}>
          <img
            src={product.image}
            alt={product.title}
            className={`w-full ${SLIDE_HEIGHT} object-cover rounded-[20px]`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PromoSlider;
