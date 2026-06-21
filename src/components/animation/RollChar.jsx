import {motion} from "framer-motion"

export function RollCharIn ({text, classNa}) {
    const totalChars = text.length;
    return <div className="flex flex-wrap overflow-hidden">
            {text.split(" ").map((word,wi)=>(
                <span key={wi} className="mr-2 whitespace-nowrap inline-flex">
                    {word.split("").map((char,i)=>
                <motion.span key={i} initial={{y:-100}} animate={{y:0, opacity:1,}} exit={{opacity:0,scale: 1.2, filter: "blur(10px)"}} transition={{delay: (wi * 5 + i) * 0.02, duration: 0.4}} className={`inline-block ${classNa}`}>
                    {char === " "?"\u00A0":char}
                </motion.span>)}</span>
            ))}
        </div>
}

export function RollCharOut (text = "Xin chào anh em!",classNa="text-base") {
    return <div className="flex overflow-hidden">
            {text.split("").map((char,i)=>(
                <motion.span key={i} initial={{y:0}} animate={{y:-40, opacity:0}} transition={{delay: i*0.05, duration: 0.4}} className={`inline-block ${classNa}`}>
                    {char === " "?"\u00A0":char}
                </motion.span>
            ))}
        </div>
}
