import concurrent.futures
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse
import os

# Function to take a screenshot of a single website
def take_screenshot(url):
    try:
        # Set up Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to the website
        driver.get(url)
        
        # Set a specific size for the viewport
        driver.set_window_size(1024, 768)
        
        # Create a filename from the URL (e.g., domain name as the filename)
        domain = urlparse(url).netloc
        filename = f"{domain}_screenshot.png"
        
        # Ensure the output directory exists
        if not os.path.exists('screenshots'):
            os.makedirs('screenshots')
        
        # Take a screenshot and save it in the 'screenshots' directory
        screenshot_path = os.path.join('screenshots', filename)
        driver.save_screenshot(screenshot_path)
        
        print(f"Screenshot taken for {url}: {screenshot_path}")
    
    except Exception as e:
        print(f"Failed to take screenshot for {url}: {str(e)}")
    
    finally:
        # Close the browser
        driver.quit()

# Function to process a batch of URLs asynchronously using ThreadPoolExecutor
def take_screenshots_batch(urls, max_workers=5):
    # Create a thread pool for parallel execution
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Map the function to each URL in the list
        results = list(executor.map(take_screenshot, urls))
    
    print("All screenshots completed.")

# Example usage
if __name__ == "__main__":
    # List of URLs to take screenshots of
    urls = [
        "https://sybil.com/",
        "https://google.com/",
        "https://github.com/",
        "https://openai.com/",
        "https://twitter.com/"
    ]
    
    # Take screenshots in parallel with a batch size of 5 workers
    take_screenshots_batch(urls, max_workers=5)
