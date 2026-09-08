import React from 'react';
import { Card, Carousel } from 'antd';

function MeetupImageCarousel({ images = [] }) {
  return (
    <Card className="meetup-image-card" styles={{ body: { padding: 0 } }}>
      <Carousel arrows infinite={false}>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`모임 이미지 ${index + 1}`}
              className="meetup-main-image"
            />
          </div>
        ))}
      </Carousel>
    </Card>
  );
}

export default MeetupImageCarousel;
