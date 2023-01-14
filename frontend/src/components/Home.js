import "./Home.css"; 
import React, { useState, useEffect, useRef} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimation,
  AnimatePresence
} from "framer-motion";

let oldAudio = null;
let mostRecentDir = "/data-start/2022";

const getNextItems = (direction) =>
  fetch(mostRecentDir)
    .then(response => response.json())
    .then(json => 
      json.Songs.map(song => {
        // Caching hack
        const img = document.createElement("img");
        img.src = song.Image;
        // console.log(img.src)
        return {
          id: song.Image,
          src: song.Image,
          label: song.Name,
          audio: song.Audio,
          artist: song.Artist,
          uri: song.Uri,
        };
      })
    )

const StartCard = ({isActive, onRemove, backgroundTransformer, handleSwipe}) => {
  const cardRef = useRef();

  const controls = useAnimation();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 0, 100], [-5, 0, 5]);

  const THRESHOLD = 69;

  if (isActive) {
    controls.start({ scale: 1 });
  }

  useEffect(
    () =>
      x.onChange(currentValue => {
        if (Math.abs(currentValue) <= THRESHOLD) {
          backgroundTransformer.set(currentValue);
        }
      }),
    [x, backgroundTransformer]
  );

  const handleDragEnd = () => {
    if (Math.abs(x.get()) > THRESHOLD) {
      backgroundTransformer.set(0);
      onRemove()
      handleSwipe()
    } else {
      controls.start({ x: 0, y: 0 });
    }
    console.log(mostRecentDir);
  };

  const backgroundImage = `url(https://source.unsplash.com/random/300x200)`;

  return (
    <motion.div
      ref={cardRef}
      className="item"
      style={{ x, rotate, backgroundImage }}
      drag={true}
    //   dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9 }}
      animate={controls}
      //animate={isActive ? { scale: 1 } : {}}
      custom={x}
      exit={x => ({ x: x.get() * 10 })}
    >
    <div class = "itemTitle"> 
        <p>  Welcome to Dittycal! Swipe left or right to start</p>
      </div>
    </motion.div>
  );
};

const Card = ({ src, isActive, onRemove, backgroundTransformer, label, audio, artist, uri, handleRight}) => {
  const cardRef = useRef();

  const controls = useAnimation();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 0, 100], [-5, 0, 5]);

  const THRESHOLD = 69;

  if (oldAudio != null){
    oldAudio.pause()
  }
  let currAudio = new Audio(audio)
  currAudio.volume = 0.5;
  currAudio.play()
  oldAudio = currAudio;

  if (isActive) {
    controls.start({ scale: 1 });
  }

  useEffect(
    () =>
      x.onChange(currentValue => {
        if (Math.abs(currentValue) <= THRESHOLD) {
          backgroundTransformer.set(currentValue);
        }
      }),
    [x, backgroundTransformer]
  );

  const handleDragEnd = () => {
    if (x.get()>0){
        mostRecentDir = "/data-right/"+uri
        handleRight(uri);
    } else {
        mostRecentDir = "/data-left/"+uri
    }
    if (Math.abs(x.get()) > THRESHOLD) {
      backgroundTransformer.set(0);
      onRemove()
    } else {
      controls.start({ x: 0, y: 0 });
    }
    console.log(mostRecentDir);
  };

  const backgroundImage = `url(${src})`;

  return (
    <motion.div
      ref={cardRef}
      className="item"
      style={{ x, rotate, backgroundImage }}
      drag={true}
    //   dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9 }}
      animate={controls}
      //animate={isActive ? { scale: 1 } : {}}
      custom={x}
      exit={x => ({ x: x.get() * 10 })}
    >
      <div class = "itemTitle"> 
        <p>{label} - By {artist}</p>
      </div>
    </motion.div>
  );
};

export default function Home(props) {
  const backgroundTransformer = useSpring(0, {
    damping: 10000,
    mass: 0.01
  });
  const background = useTransform(
    backgroundTransformer,
    [-50, 0, 50],
    [
      "linear-gradient(90deg, rgba(255,145,145,1) 0%, rgba(255,145,145,0) 50%, rgba(15,15,15,0) 100%)",
      "linear-gradient(90deg, rgba(15,15,15,0) 0%, rgba(15,15,15,0) 50%, rgba(15,15,15,0) 100%)",
      "linear-gradient(90deg, rgba(15,15,15,0) 0%, rgba(126,255,99,0) 50%, rgba(126,255,99,1) 100%)"
    ]
  );

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [start, setStart] = useState(true);

  useEffect(() => {
    if (items.length < 1) {
        getNextItems(mostRecentDir)
        .then(newItems => {
          setItems([...items, ...newItems]);
          if (loading) setLoading(false);
        })
        .catch(err => console.error(err));
    }
  });

  const handleRemoveItem = () => {
    setItems(items.slice(1));
  };
  const sendIt = (uri) => {
    props.handleLike(uri);
  }

  const displayItems = items.slice(0, 1);
  const activeItem = displayItems[0];


  const endStart = () => {
    setStart(false)
  }

  displayItems.reverse(); // the first item should be rendered the last
  if (start) {
    return (
      <motion.div className="App" style={{ background }}>
        <AnimatePresence>
          {displayItems.map(item => (
            <StartCard
              isActive={item === activeItem}
              onRemove={handleRemoveItem}
              backgroundTransformer={backgroundTransformer}
              handleSwipe = {endStart}
            />
          ))}
        </AnimatePresence>
    </motion.div>
    )
  }
  return (
    <motion.div className="App" style={{ background }}>
      {loading && <div>Loading...</div>}
      {!loading && (
        <AnimatePresence>
          {displayItems.map(item => (
            <Card
              key={item.id}
              src={item.src}
              isActive={item === activeItem}
              onRemove={handleRemoveItem}
              backgroundTransformer={backgroundTransformer}
              label = {item.label}
              audio = {item.audio}
              artist = {item.artist}
              uri = {item.uri}
              handleRight = {sendIt}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
}