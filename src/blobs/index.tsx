import * as React from "react";
import * as blobs2 from "blobs/v2";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { colorPairs, ValidDefaultColor } from "../color-grid/colors";
import css from "./blobs.module.css";
import CopyableText from "../components/copyable-text";
import SvgBlob, { blobAsString, SvgBlobProps } from "../components/svg-blob";
import useThrottle from "@react-hook/throttle";
import DownloadGroup from "./download-group";

const BlobGenerator: React.FC<{}> = () => {
  const [image, setImage] = useState<File | undefined>();
  const [points, setPoints] = useThrottle<number>(2);
  const [size, setSize] = useThrottle<number>(250);
  const [randomness, setRandomness] = useThrottle<number>(9);
  const [fill, setFill] = useThrottle<ValidDefaultColor>(
    colorPairs.primary.default.bg
  );
  const [imageScale, setScale] = useThrottle<number>(100);

  const [seed, setSeed] = useState(Math.random());
  const random = () => setSeed(Math.random());
  useEffect(random, [points, randomness]);

  const svgPath = blobs2.svgPath({
    seed,
    extraPoints: points,
    randomness,
    size,
  });

  const svgOpts = {
    path: svgPath,
    color: fill,
    size,
    image,
    imageScale,
  };

  return (
    <div>
      <Group name="Points">
        <Input
          min={3}
          max={15}
          onInput={(i) => setPoints(i - 3)}
          val={points + 3}
        />
      </Group>
      <Group name="size">
        <Input min={100} max={1000} step={10} onInput={setSize} val={size} />
      </Group>
      <Group name="Point spread">
        <Input min={1} max={20} onInput={setRandomness} val={randomness} />
      </Group>

      <Group name="Fill color">
        <input
          type="color"
          onChange={(e) => setFill(e.currentTarget.value as ValidDefaultColor)}
          value={fill}
        />
      </Group>

      <Group name="Image (optional)">
        <UploadFile value={image} onChange={setImage} />

        {image && (
          <div>
            <Input val={imageScale} min={10} max={200} onInput={setScale} />
            <button onClick={() => setImage(undefined)} type="button">
              Clear image
            </button>
          </div>
        )}
      </Group>

      <button onClick={random} type="button">
        Random
      </button>

      {/* <div dangerouslySetInnerHTML={{ __html: svgString }}></div> */}
      <SvgBlob {...svgOpts} />

      <p className="caption">
        Seed: <CopyableText Component="span">{seed}</CopyableText>
      </p>
      <div className={css.downloadLinks}>
        <DownloadGroup seed={seed} {...svgOpts} />
      </div>
    </div>
  );
};

export default BlobGenerator;

const Group: React.FC<{
  name: string;
}> = ({ name, children }) => {
  return (
    <div>
      <h4>{name}</h4>

      {children}
    </div>
  );
};

const Input: React.FC<{
  val: number;
  onInput: (val: number) => void;
  min: number;
  max: number;
  step?: number;
}> = ({ onInput, min, max, val, step = 1 }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onInput(Number(e.currentTarget.value))}
    />
  );
};

const UploadFile: React.FC<{
  value?: File;
  onChange(imgBase64?: File): void;
}> = ({ value, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);

  const internalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    onChange(file);
  };

  useEffect(() => {
    if (!value && ref.current) {
      ref.current.value = "";
    }
  }, [value]);

  return (
    <input
      ref={ref}
      type="file"
      accept="image/png, image/jpeg"
      onChange={internalChange}
    />
  );
};
