import { useEffect } from "react";

export default function useAutoBackground() {
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const today = new Date();

    const backgrounds = [
      {
        name: "noel",
        from: "12-01",
        to: "01-15",
        pc: "https://lh3.googleusercontent.com/d/1r8SDijseJIHfNwYL3ccPmuQ8TmzBFNtc",
        mobile: "https://lh3.googleusercontent.com/d/1Xjjjgn0355YzYMlXTpJDeRE6OyaqE7ys",
      },
      {
        name: "phucsinh",
        from: "03-22",
        to: "04-30",
        pc: "https://lh3.googleusercontent.com/d/1dWAhu4xYQMC1wnaXHho48f8Qg48UmqPd",
        mobile: "https://lh3.googleusercontent.com/d/1TEP1pUpCR7oc9ZqtYNf3WTSVP4vLBkt_",
      },
    ];

    function inRange(from, to) {
      const year = today.getFullYear();
      let start = new Date(`${year}-${from}`);
      let end = new Date(`${year}-${to}`);

      // khoảng qua năm (12 → 1)
      if (start > end) {
        if (today.getMonth() === 0) {
          start = new Date(`${year - 1}-${from}`);
        } else {
          end = new Date(`${year + 1}-${to}`);
        }
      }

      return today >= start && today <= end;
    }

    let bg = null;
    for (const b of backgrounds) {
      if (inRange(b.from, b.to)) {
        bg = isMobile ? b.mobile : b.pc;
        break;
      }
    }

    if (!bg) {
      bg = isMobile
        ? "https://lh3.googleusercontent.com/d/15GTxjKJt_2thHr-fo8gmNVXkFvSWUor4"
        : "https://lh3.googleusercontent.com/d/1HK_o0VChFjTHiTEVbStsrZcC72bhRN4n";
    }

    document.body.style.background = `
      linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
      url('${bg}') center / cover no-repeat fixed
    `;

    // cleanup (optional)
    return () => {
      document.body.style.background = "";
    };
  }, []);
}
