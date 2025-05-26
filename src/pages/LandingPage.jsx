import { useNavigate } from "react-router-dom";
import dorianImg from "../assets/dorian.png";
import dorianLogo from "../assets/dorianLogo.png";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ backgroundColor: "#000000", opacity: 0 }}
      animate={{ backgroundColor: "#000000", opacity: 1 }}
      exit={{ backgroundColor: "#000000", opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-screen w-screen flex flex-col md:flex-row bg-black text-white"
    >
      <div
        className="w-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(69, 154, 255, 0.3), rgba(0, 0, 0, 0), rgba(162, 15, 15, 0.5)), url(${dorianImg})`,
        }}
      ></div>
      <div className="flex flex-col items-start p-10 gap-6">
        <h1
          className="text-2xl font-inter font-thin tracking-widest text-white flex items-center gap-2 pt-10 pb-25"
          style={{ letterSpacing: "0.3em" }}
        >
          <img src={dorianLogo} alt="Logo" className="w-10 h-12 me-2" />
          <p>
            <span className="text-gray-200 font-light">TheBot</span>
            <span className="text-blue-400 font-medium">OfDorianGray</span>
          </p>
        </h1>

        <h2 className="text-6xl font-semibold leading-tight ">
          Explore literature with <br />
          <span className="bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent">
            The Bot Of DorianGray
          </span>
        </h2>

        <p className="text-gray-300">
          Step into the world of <em>The Picture of Dorian Gray</em> with
          DorianAI. <br />
          Analyze themes, explore characters, and uncover the hidden <br />
          depths of Oscar Wilde’s masterpiece.
        </p>

        <h2 className="text-xl font-semibold">Get Started today!</h2>

        <button
          onClick={() => navigate("/start")}
          className="mt-4 px-15 py-3 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-lg cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </motion.div>
  );
}
