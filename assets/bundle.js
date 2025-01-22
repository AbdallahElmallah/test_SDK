// Bundle.js
(function() {
    // Utility functions
    const createElement = (tag, props = {}, ...children) => {
      const element = document.createElement(tag);
      
      // Set properties
      Object.entries(props || {}).forEach(([key, value]) => {
        if (key.startsWith('on')) {
          // Event listeners
          element.addEventListener(key.toLowerCase().slice(2), value);
        } else {
          // Regular attributes
          element.setAttribute(key, value);
        }
      });
      
      // Append children
      children.flat().forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          element.appendChild(child);
        }
      });
      
      return element;
    };
  
    // State management
    let count = 0;
    const subscribers = new Set();
  
    const updateState = (newCount) => {
      count = newCount;
      subscribers.forEach(callback => callback(count));
    };
  
    // Components
    const Counter = () => {
      const container = createElement('div', { class: 'counter' });
      
      const update = (count) => {
        container.innerHTML = '';
        container.appendChild(
          createElement('div', { class: 'counter-content' },
            createElement('h2', {}, `Count: ${count}`),
            createElement('button', { 
              onClick: () => {
                updateState(count + 1);
                // Communicate with Flutter
                if (window.Flutter) {
                  Flutter.postMessage(JSON.stringify({ 
                    type: 'counter_updated', 
                    value: count + 1 
                  }));
                }
              },
              class: 'button'
            }, 'Increment'),
            createElement('button', { 
              onClick: () => {
                updateState(count - 1);
                // Communicate with Flutter
                if (window.Flutter) {
                  Flutter.postMessage(JSON.stringify({ 
                    type: 'counter_updated', 
                    value: count - 1 
                  }));
                }
              },
              class: 'button'
            }, 'Decrement')
          )
        );
      };
  
      subscribers.add(update);
      update(count);
      return container;
    };
  
    // Styles
    const styles = document.createElement('style');
    styles.textContent = `
      .counter {
        font-family: sans-serif;
        padding: 20px;
        text-align: center;
      }
      
      .counter-content {
        max-width: 300px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .button {
        background-color: #007AFF;
        color: white;
        border: none;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }
      
      .button:active {
        background-color: #0056b3;
      }
      
      h2 {
        color: #333;
        margin-bottom: 20px;
      }
    `;
  
    // Initialize the app
    window.addEventListener('DOMContentLoaded', () => {
      // Add styles
      document.head.appendChild(styles);
      
      // Mount the app
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(Counter());
      }
  
      // Listen for messages from Flutter
      window.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'reset_counter') {
            updateState(0);
          }
        } catch (e) {
          console.error('Error processing message:', e);
        }
      });
    });
  })();