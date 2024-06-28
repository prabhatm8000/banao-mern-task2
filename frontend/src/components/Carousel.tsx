import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import type { MediaDataType } from "../../../backend/src/types";
import { useEffect, useState } from "react";

const Carousel = ({
    imageUrls,
    autoSlide,
    hightClass,
}: {
    imageUrls: MediaDataType[];
    autoSlide: boolean;
    hightClass?: string;
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide === imageUrls.length - 1) {
            setCurrentSlide(0);
        } else {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide === 0) {
            setCurrentSlide(imageUrls.length - 1);
        } else {
            setCurrentSlide(currentSlide - 1);
        }
    };

    useEffect(() => {
        if (!autoSlide) return;

        const interval = setInterval(() => {
            nextSlide();
        }, Math.random() * 2000 + 3000);
        return () => clearInterval(interval);
    });
    return (
        <div
            className={`relative ${
                hightClass ? hightClass : "h-[calc(380px-56px-16px)]"
            }`}
        >
            <div className="relative overflow-hidden w-full h-full rounded-lg">
                <div className="absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 w-full">
                    <div className="w-full">
                        <div className="flex justify-center h-full w-full">
                            <img
                                src={imageUrls[currentSlide].url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={prevSlide}
                className="absolute inset-y-0 start-0 inline-flex justify-center items-center w-[46px] h-full hover:bg-white/15 text-black rounded-s-lg"
            >
                <IoIosArrowBack size={24} />
                <span className="sr-only">Previous</span>
            </button>
            <button
                type="button"
                onClick={nextSlide}
                className="absolute inset-y-0 end-0 inline-flex justify-center items-center w-[46px] h-full hover:bg-white/15 text-black rounded-e-lg"
            >
                <span className="sr-only">Next</span>
                <IoIosArrowForward size={24} />
            </button>

            <div className="flex justify-center absolute bottom-3 start-0 end-0 space-x-2">
                {imageUrls.map((_, index) => {
                    if (index === currentSlide) {
                        return (
                            <span
                                key={index}
                                className="size-2 border border-white bg-blue-500 rounded-full"
                            ></span>
                        );
                    }
                    return (
                        <span
                            key={index}
                            className="size-2 border border-gray-400 rounded-full"
                        ></span>
                    );
                })}
            </div>
        </div>
    );
};

export default Carousel;
