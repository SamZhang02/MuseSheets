import puppeteer from "puppeteer";

const validateUrl = (url: string) => {
  return url.startsWith("https://musescore.com/");
}

// Get the sheets from a musescore URL, returns an array of SVGs
export const getSheets = async (url: string): Promise<string[]> => {
  if (!validateUrl(url)) {
    throw new Error("Invalid musescore URL");
  }

  // Init 
  const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] })
  const page = await browser.newPage();
  await page.setViewport({ width: 1960, height: 1080 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector("#jmuse-scroller-component");

  const svgs: string[] = await page.evaluate((): Promise<string[]> => {
    return new Promise((resolve) => {
      const scroller = document.getElementById('jmuse-scroller-component');
      if (!scroller) {
        resolve([]);
        return;
      }


      let scrollHeight = scroller.scrollHeight;
      let scrollStep = 1450;
      let scrollCount = 0;

      const waitForImages = (callback: () => any) => {
        const images = document.querySelectorAll('#jmuse-scroller-component > div > img');
        let loaded = true;
        images.forEach((img) => {
          if (!img.getAttribute('src')) {
            loaded = false;
          }
        });
        if (loaded) {
          callback();
        } else {
          setTimeout(() => waitForImages(callback), 100); // Check every 100ms
        }
      };

      let svgs: string[] = [];
      // Scroll down one page at a time to load the sheets and download them
      let scrollInterval = setInterval(() => {
        scroller.scrollTop = scrollStep * scrollCount;
        scrollCount++;

        waitForImages(() => {
          document.querySelectorAll('#jmuse-scroller-component > div > img').forEach((img) => {
            const imgSrc = img.getAttribute('src');
            if (imgSrc && !svgs.includes(imgSrc)) {
              svgs.push(imgSrc);
            }
          });
        });

        if (scrollStep * scrollCount >= scrollHeight) {
          clearInterval(scrollInterval);
          resolve(svgs);
        }
      }, 1000); // Adjust interval as needed
    })
  })

  browser.close();
  return svgs;
};
