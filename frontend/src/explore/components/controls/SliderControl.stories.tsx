import SliderControl from './SliderControl';

export default {
  title: 'Components/SliderControl',
  component: SliderControl,
};

export const SliderControlGallery = () => (
  <>
    <h4>value</h4>
    <SliderControl value={25} onChange={() => {}} />
    <h4>default</h4>
    <SliderControl default={50} value={25} onChange={() => {}} />
  </>
);
