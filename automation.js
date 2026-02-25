const { chromium } = require('playwright');

// ============================================
// CONFIGURATION VARIABLES
// ============================================
const NUMBER_OF_SEATS = 2;  // Change this to select how many seats you need
// ============================================

(async () => {
  let browser;
  try {
    console.log('Starting browser...');
    console.log(`Configured to select ${NUMBER_OF_SEATS} seat(s)`);
    
    browser = await chromium.launch({ 
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✓ Browser started successfully');
    
    const page = await browser.newPage();
    
    console.log('✓ New page created');
    
    // Set realistic viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('https://eticket.railway.gov.bd/login');
    console.log('✓ Page loaded');
    
    // Add some human-like behavior - random wait before interacting
    await page.waitForTimeout(Math.random() * 1000 + 500);
    
    // Wait for mobile number field and fill it
    console.log('Filling mobile number...');
    await page.waitForSelector('#mobile_number', { timeout: 5000 });
    
    // Move mouse to field and click (human-like)
    await page.hover('#mobile_number');
    await page.waitForTimeout(Math.random() * 500 + 200);
    await page.click('#mobile_number');
    
    // Type with delays between characters (human-like typing)
    const mobile = '01767552562';
    for (const char of mobile) {
      await page.keyboard.type(char);
      await page.waitForTimeout(Math.random() * 50 + 30);
    }
    console.log('✓ Mobile number entered: ' + mobile);
    
    // Wait and move to password field
    await page.waitForTimeout(Math.random() * 500 + 300);
    console.log('Filling password...');
    await page.hover('#password');
    await page.waitForTimeout(Math.random() * 500 + 200);
    await page.click('#password');
    
    // Type password with delays
    const password = 'r01718910687';
    for (const char of password) {
      await page.keyboard.type(char);
      await page.waitForTimeout(Math.random() * 50 + 30);
    }
    console.log('✓ Password entered');
    
    // Now focus on clicking the LOGIN button
    console.log('Attempting to click LOGIN button...');
    
    // Get all buttons and find the login one
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons on the page`);
    
    let loginButtonClicked = false;
    
    // Try different ways to find and click the login button
    const loginButtonSelectors = [
      'button.login-form-submit-btn',
      'button[type="submit"]',
      'button:has-text("LOGIN")',
      'button:has-text("login")'
    ];
    
    for (const selector of loginButtonSelectors) {
      try {
        const btn = await page.$(selector);
        if (btn) {
          // Check if button is enabled
          const isDisabled = await page.evaluate((sel) => {
            const button = document.querySelector(sel);
            return button && button.disabled;
          }, selector);
          
          console.log(`Found button with selector "${selector}", disabled: ${isDisabled}`);
          
          if (!isDisabled) {
            console.log(`Clicking button with selector: ${selector}`);
            await page.click(selector, { force: true, delay: 200 });
            console.log('✓ LOGIN button clicked');
            loginButtonClicked = true;
            break;
          }
        }
      } catch (e) {
        console.log(`Could not click with selector "${selector}": ${e.message}`);
      }
    }
    
    if (!loginButtonClicked) {
      console.log('⚠ Could not click login button with standard selectors');
      
      // Try clicking using JavaScript
      console.log('Attempting to click using JavaScript...');
      await page.evaluate(() => {
        const btn = document.querySelector('button.login-form-submit-btn');
        if (btn) {
          btn.disabled = false;
          btn.click();
          console.log('Clicked via JavaScript');
        }
      });
      console.log('✓ Clicked via JavaScript');
    }
    
    // Wait for page navigation
    console.log('Waiting for page to navigate...');
    try {
      await page.waitForNavigation({ timeout: 15000 });
      console.log('✓ Login successful! Page navigated');
    } catch {
      console.log('⚠ Navigation timeout - page may have stayed open');
    }
    
    // Wait a moment for page to fully load
    await page.waitForTimeout(2000);
    
    // Wait until 8:00 AM to navigate to booking page

   /* 
   
   console.log('Waiting for 8:00 AM to open booking page...');
    let isBookingTime = false;
    while (!isBookingTime) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Check if current time is 8:00 AM (08:00:00)
      if (hours === 8 && minutes === 0 && seconds === 0) {
        isBookingTime = true;
        console.log('✓ 8:00 AM reached! Opening booking page...');
        break;
      }
      
      // Log time every 10 seconds
      if (minutes % 1 === 0 && seconds === 0) {
        console.log(`Current time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Waiting for 08:00:00`);
      }
      
      // Check every 100ms
      await page.waitForTimeout(10);
    }
    */

    
    // Navigate to the booking page
    console.log('Navigating to booking page...');
    await page.goto('https://eticket.railway.gov.bd/booking/train/search?fromcity=Dhaka&tocity=Nilphamari&doj=06-Mar-2026&class=SNIGDHA');
    console.log('✓ Booking page loaded');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Enter fullscreen mode
    console.log('Entering fullscreen mode...');
    await page.evaluate(() => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          console.log('Fullscreen request failed, continuing anyway');
        });
      }
    });
    await page.waitForTimeout(1000);
    
    // Wait for CHILAHATI EXPRESS train to appear
    console.log('Waiting for CHILAHATI EXPRESS (805) to appear...');
    
    let trainFound = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!trainFound && attempts < maxAttempts) {
      // Check if the train name is visible
      const trainVisible = await page.evaluate(() => {
        const trainElement = Array.from(document.querySelectorAll('h2')).find(el => 
          el.textContent.includes('CHILAHATI EXPRESS')
        );
        return trainElement ? true : false;
      });
      
      if (trainVisible) {
        console.log('✓ CHILAHATI EXPRESS (805) found!');
        trainFound = true;
        break;
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`⚠ Train not found, reloading page (attempt ${attempts}/${maxAttempts})...`);
          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
        } else {
          console.log('❌ CHILAHATI EXPRESS (805) not found after multiple attempts');
        }
      }
    }
    
    if (trainFound) {
      // Loop until we find a coach with available seats
      let seatsAvailable = false;
      let attempts = 0;
      const maxRetries = 10;
      
      while (!seatsAvailable && attempts < maxRetries) {
        // Wait for the BOOK NOW button for SNIGDHA to be available
        console.log('Looking for SNIGDHA BOOK NOW button in CHILAHATI EXPRESS (805)...');
        
        // Try to find and click the BOOK NOW button for SNIGDHA class ONLY in CHILAHATI EXPRESS
        const snigdhaButtonClicked = await page.evaluate(() => {
          // Find the h2 element containing CHILAHATI EXPRESS
          const trainHeaders = document.querySelectorAll('h2');
          let chilahatiContainer = null;
          
          for (let header of trainHeaders) {
            if (header.textContent.includes('CHILAHATI EXPRESS')) {
              // Found the correct train, now get the parent container
              let parent = header.closest('.row.single-trip-wrapper');
              if (parent) {
                chilahatiContainer = parent;
                break;
              }
            }
          }
          
          if (!chilahatiContainer) {
            console.log('Could not find CHILAHATI EXPRESS container');
            return false;
          }
          
          console.log('Found CHILAHATI EXPRESS (805) container');
          
          // Now find all seat class containers within this train only
          const seatClasses = chilahatiContainer.querySelectorAll('.single-seat-class');
          console.log(`Found ${seatClasses.length} seat classes in CHILAHATI EXPRESS`);
          
          for (let classDiv of seatClasses) {
            // Check if this is the SNIGDHA class
            const classNameEl = classDiv.querySelector('.seat-class-name');
            if (classNameEl && classNameEl.textContent.trim() === 'SNIGDHA') {
              console.log('Found SNIGDHA class in CHILAHATI EXPRESS');
              // Find the BOOK NOW button in this container
              const bookBtn = classDiv.querySelector('.book-now-btn');
              if (bookBtn) {
                console.log('Clicking SNIGDHA BOOK NOW button for CHILAHATI EXPRESS (805)');
                bookBtn.click();
                return true;
              }
            }
          }
          return false;
        });
        
        if (snigdhaButtonClicked) {
          console.log('✓ CHILAHATI EXPRESS SNIGDHA BOOK NOW button clicked successfully');
        } else {
          console.log('❌ Could not find or click SNIGDHA BOOK NOW button in CHILAHATI EXPRESS (805)');
        }
        
        // Wait for seat layout modal to open
        await page.waitForTimeout(3000);
        
        // Select the coach with the most available seats
        console.log('Selecting coach with maximum available seats...');
        
        const coachResult = await page.evaluate(() => {
          const dropdown = document.querySelector('#select-bogie');
          if (!dropdown) {
            console.log('Coach dropdown not found');
            return { selected: false, maxSeats: 0 };
          }
          
          const options = dropdown.querySelectorAll('option');
          let maxSeats = 0;
          let selectedValue = null;
          let selectedCoach = null;
          
          // Parse options and find the one with most seats
          for (let option of options) {
            const text = option.textContent;
            const match = text.match(/(\d+)\s*Seat/);
            if (match) {
              const seats = parseInt(match[1]);
              console.log(`Coach ${text.trim()}: ${seats} seats`);
              if (seats > maxSeats) {
                maxSeats = seats;
                selectedValue = option.value;
                selectedCoach = text.trim();
              }
            }
          }
          
          if (selectedValue !== null && maxSeats > 0) {
            dropdown.value = selectedValue;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Selected coach: ${selectedCoach} with ${maxSeats} seats`);
            return { selected: true, maxSeats: maxSeats };
          }
          
          console.log('No coach with available seats found');
          return { selected: false, maxSeats: 0 };
        });
        
        if (coachResult.selected && coachResult.maxSeats > 0) {
          console.log('✓ Coach with maximum seats selected');
          seatsAvailable = true;
          
          // Wait for seat layout to update
          await page.waitForTimeout(2000);
          
          // Click on available seats (number based on configuration)
          console.log(`Clicking on ${NUMBER_OF_SEATS} available seat(s)...`);
          let seatsSelectedCount = 0;
          
          for (let i = 0; i < NUMBER_OF_SEATS; i++) {
            const seatClicked = await page.evaluate(() => {
              // Find all available seat buttons
              const availableSeats = document.querySelectorAll('.btn-seat.seat-available');
              console.log(`Found ${availableSeats.length} available seats`);
              
              if (availableSeats.length > 0) {
                // Click the first available seat
                const seat = availableSeats[0];
                const seatName = seat.getAttribute('title');
                console.log(`Clicking seat: ${seatName}`);
                seat.click();
                return seatName;
              }
              return null;
            });
            
            if (seatClicked) {
              seatsSelectedCount++;
              console.log(`✓ Seat ${i + 1} clicked: ${seatClicked}`);
              // Wait for UI to update before clicking next seat
              await page.waitForTimeout(500);
            } else {
              console.log(`❌ No more available seats found. Stopped after ${seatsSelectedCount} seat(s)`);
              break;
            }
          }
          
          if (seatsSelectedCount > 0) {
            console.log(`✓ Successfully selected ${seatsSelectedCount} seat(s)`);
          } else {
            console.log('❌ No available seats found to click');
          }
          
          // Wait for seat selections to register
          await page.waitForTimeout(1500);
        } else {
          // No seats available, reload the booking page and try again
          attempts++;
          console.log(`⚠ All coaches have 0 tickets. Reloading booking page (attempt ${attempts}/${maxRetries})...`);
          
          if (attempts < maxRetries) {
            await page.goto('https://eticket.railway.gov.bd/booking/train/search?fromcity=Dhaka&tocity=Nilphamari&doj=06-Mar-2026&class=SNIGDHA');
            console.log('✓ Booking page reloaded');
            await page.waitForTimeout(3000);
          } else {
            console.log('❌ Max retries reached. Could not find available seats.');
          }
        }
      }
    }
    
    console.log('\n✓ Automation complete! Press Ctrl+C to close.');
    
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('Stack:', error.stack);
  }
})();
