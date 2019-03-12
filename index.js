var bookmarkSets = [];

async function testAddBookmarkSets() {
  let testurl = 'https://www.google.com';
  await browser.storage.local.set({
    'setNum': 2,
    'bookmarkSet0': [
      ['google', testurl],
      ['test2', testurl],
      ['fff', testurl]
    ],
    'bookmarkSet1': [
      ['col2', testurl],
      ['test2', testurl],
      ['fff', testurl]
    ]
  })
}

async function readBookmarkSets() {
  // await testAddBookmarkSets();

  const response = await browser.storage.local.get('setNum');
  let setNum = response.setNum;
  // what if setNum = 0? what if no sets
  let promises = [...Array(setNum).keys()].map(async x => {
    const setName = 'bookmarkSet' + x;
    const response = await browser.storage.local.get(setName);
    return response[setName];
  });
  // any possible errors?
  bookmarkSets = await Promise.all(promises);
  // console.log('responses: ', bookmarkSets);
  massAddBookmarks();
}



function setItem() {
  console.log("OK");
}

function onError(error) {
  console.log(error);
}

// function changeColor(e) {
//   if (e.keyCode == 13) {
//     let val = document.getElementById("color-field").value;
//     document.body.style.backgroundColor = val;

//     browser.storage.local.set({
//       backgroundColor: val
//     }).then(setItem, onError);
//   }
// }

function clickChangeColor(color) {
  // console.log('clicked');
  // console.log(color);
  document.body.style.backgroundColor = color;

  browser.storage.local.set({
    backgroundColor: color
  })
}

function addBookmark(e) {
  if (e.keyCode != 13) return;
  const href = document.getElementById('href-field').value;
  const name = document.getElementById('name-field').value;
  const ind = document.getElementById('ind-field').value;

  addBookmarkHelper(href, name, ind);

  // store data
  browser.storage.local.set({
    href: href
  });
}

function addBookmarkHelper(href, name, ind) {

  let inner =
    `<div class='setting-wrapper'>
      <div class=' bookmark-action-menu'>
        <div class='bookmark-action-button lift-bookmark-button'> ^ </div>
        <div class='bookmark-action-button lower-bookmark-button'> v </div>
        <div class='bookmark-action-button  delete-bookmark-button'> X </div>
      </div>
    </div>
    <a class="bookmark" href="${href}">${name}</a>`

  let newBookMark = document.createElement('div');
  newBookMark.className = 'bookmark-wrapper';
  newBookMark.innerHTML = inner;

  let [liftBookmarkButton, lowerBookmarkButton, deleteBookmarkButton] = newBookMark.firstElementChild.firstElementChild.children;

  deleteBookmarkButton.addEventListener('click', function() {
    deleteBookmark(this.parentNode.parentNode.parentNode);
  })

  liftBookmarkButton.addEventListener('click', function() {
    liftBookmark(this.parentNode.parentNode.parentNode);
  })

  lowerBookmarkButton.addEventListener('click', function() {
    lowerBookmark(this.parentNode.parentNode.parentNode);
  })

  document.getElementsByClassName('bookmark-inner-container')[ind].appendChild(newBookMark);
}

function massAddBookmarks() {
  // console.log('start')
  let setNum = bookmarkSets.length;
  // console.log('setnum is ' + setNum)
  for (i = 0; i < setNum; i++) {
    // console.log('col ' + i)
    for (bookmarkRecord of bookmarkSets[i]) {
      // console.log(bookmarkRecord)
      addBookmarkHelper(bookmarkRecord[1], bookmarkRecord[0], i);
    }
  }
}

function search(e) {
  if (e.keyCode == 13) {
    let val = document.getElementById("search-field").value;
    window.open("https://google.com/search?q=" + val);
  }
}

async function getWeather() {

  const response = await browser.storage.local.get('weathers');
  const weathers = response.weathers;
  // console.log('w is ', weathers)

  if (!weathers) {
    getNewWeather();
  } else {
    const [lastAccessTime, temp, description] = response.weathers;
    const MinsPassed = (Date.now() - lastAccessTime) / 60000;
    if (MinsPassed < 10) {
      // console.log(MinsPassed);
      document.getElementById("temp").innerHTML = temp + " C";
      document.getElementById("weather-description").innerHTML = description;
    } else {
      getNewWeather();
    }
  }

  // let getting = browser.storage.local.get('weathers');

  // getting.then(
  //   (res) => {
  //     if (!res.weathers) {
  //       getNewWeather();
  //     }
  //     let [lastAccessTime, temp, weather] = res.weathers;
  //     // console.log(lastAccessTime);
  //     let MinsPassed = (Date.now() - lastAccessTime) / 60000;
  //     if (MinsPassed < 10) {
  //       // console.log(MinsPassed);
  //       document.getElementById("temp").innerHTML = temp + " C";
  //       document.getElementById("weather-description").innerHTML = weather;
  //     } else {
  //       getNewWeather();
  //     }
  //   }, onError)
}

function getNewWeather() {

  let xhr = new XMLHttpRequest();
  // Request to open weather map
  xhr.open('GET', 'https://api.openweathermap.org/data/2.5/weather?id=1819729&units=metric&appid=5158521e8a2552a7ad3f80083da74ca7');
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let json = JSON.parse(xhr.responseText);
        // console.log(json);
        let temp = json.main.temp.toFixed(0);
        let description = json.weather[0].description;
        document.getElementById("temp").innerHTML = temp + " C";
        document.getElementById("weather-description").innerHTML = description;
        let lastAccessTime = Date.now();
        browser.storage.local.set({
          weathers: [lastAccessTime, temp, description]
        });
      } else {
        console.log('error msg: ' + xhr.status);
      }
    }
  }
  xhr.send();
}

// Get current time and format
function getTime() {
  let date = new Date(),
    hour = date.getHours(),
    min = date.getMinutes();
  // sec = date.getSeconds();

  return "" +
    (hour < 10 ? ("0" + hour) : hour) +
    ":" +
    (min < 10 ? ("0" + min) : min);
  // + ":" +  (sec < 10 ? ("0" + sec) : sec);
}

async function loadColor() {
  const response = await browser.storage.local.get('backgroundColor');
  const backgroundColor = response.backgroundColor;
  document.documentElement.style.backgroundColor = backgroundColor;
}

function getElementIndex(node) {
  let index = 0;
  while ((node = node.previousElementSibling)) {
    index++;
  }
  return index;
}

function saveBookmarkSets(ind) {
  let name = `bookmarkSet${ind}`;
  browser.storage.local.set({
    [name]: bookmarkSets[ind]
    })
    .then(console.log('saved', bookmarkSets[ind], 'as', name))
}

function deleteBookmark(target) {
  let indexInSet = getElementIndex(target);
  let indexOfSet = getElementIndex(target.parentNode.parentNode);

  target.parentNode.removeChild(target);

  bookmarkSets[indexOfSet].splice(indexInSet, 1);
  console.log(bookmarkSets[indexOfSet])
  // saveBookmarkSets(indexOfSet);
}

function liftBookmark(target) {
  let prevS = target.previousElementSibling;
  if (!prevS) return;

  let indexInSet = getElementIndex(target);
  let indexOfSet = getElementIndex(target.parentNode.parentNode);
  // console.log(indexInSet, indexOfSet)

  target.parentNode.insertBefore(target, prevS);

  let tmp = bookmarkSets[indexOfSet][indexInSet];
  bookmarkSets[indexOfSet][indexInSet] = bookmarkSets[indexOfSet][indexInSet - 1];
  bookmarkSets[indexOfSet][indexInSet - 1] = tmp;
  // console.log(bookmarkSets[indexOfSet]);
  saveBookmarkSets(indexOfSet)
}

function lowerBookmark(target) {
  let nextS = target.nextElementSibling;
  if (!nextS) return;

  let indexInSet = getElementIndex(target)
  let indexOfSet = getElementIndex(target.parentNode.parentNode);
  // console.log(indexInSet, indexOfSet)

  target.parentNode.insertBefore(nextS, target);

  let tmp = bookmarkSets[indexOfSet][indexInSet];
  bookmarkSets[indexOfSet][indexInSet] = bookmarkSets[indexOfSet][indexInSet + 1];
  bookmarkSets[indexOfSet][indexInSet + 1] = tmp;
  // console.log(bookmarkSets[indexOfSet]);
  saveBookmarkSets(indexOfSet)
}



function addListeners() {


  document.getElementById("search-field").addEventListener("keypress", function(event) {
    return search(event);
  });

  let color_buttons = document.getElementsByClassName('color');
  for (color_button of color_buttons) {
    // color_button.onclick = function() {clickChangeColor(this)};
    color_button.addEventListener('click', function() {
      let color = this.innerHTML;
      clickChangeColor(color);
    });
    // console.log(color_button);
  }

  document.getElementById('toggle-setting').addEventListener('click', function() {
    let settings = document.getElementsByClassName('setting');
    for (setting of settings) {
      // console.log(setting);
      let style = getComputedStyle(setting, null).display;
      setting.style.display = style == 'none' ? 'block' : 'none';
    }

    let settingWrappers = document.getElementsByClassName('setting-wrapper');
    for (settingWrapper of settingWrappers) {
      // console.log(setting);
      let style = getComputedStyle(settingWrapper, null).display;
      settingWrapper.style.display = style == 'none' ? 'block' : 'none';
    }
  })

  document.addEventListener("keyup", event => {
    // console.log(event.keyCode)
    if (event.keyCode == 32) { // Spacebar code to open search
      document.getElementById('search').style.display = 'flex';
      document.getElementById('search-field').focus();
    } else if (event.keyCode == 27) { // Esc to close search
      document.getElementById('search-field').value = '';
      document.getElementById('search-field').blur();
      document.getElementById('search').style.display = 'none';
    }
  })

  let bookmarkInputs = document.getElementsByClassName('bookmark-input');
  for (bookmarkInput of bookmarkInputs) {
    bookmarkInput.addEventListener('keypress', function(evt) {
      return addBookmark(evt);
    });
  }

  // let deleteBookmarkButtons = document.getElementsByClassName('delete-bookmark-button');
  // for (deleteBookmarkButton of deleteBookmarkButtons) {
  //   deleteBookmarkButton.addEventListener('click', function () {
  //     deleteBookmark(this.parentNode.parentNode.parentNode);
  //   })
  // };

  // let liftBookmarkButtons = document.getElementsByClassName('lift-bookmark-button');
  // for (liftBookmarkButton of liftBookmarkButtons) {
  //   liftBookmarkButton.addEventListener('click', function () {
  //     liftBookmark(this.parentNode.parentNode.parentNode);
  //   })
  // };


  // let lowerBookmarkButtons = document.getElementsByClassName('lower-bookmark-button');
  // for (lowerBookmarkButton of lowerBookmarkButtons) {
  //   lowerBookmarkButton.addEventListener('click', function () {
  //     lowerBookmark(this.parentNode.parentNode.parentNode);
  //   })
  // };
}

function initPage() {
  // loadColor();

  readBookmarkSets();
  // console.log(bookmarkSets);

  // addBookmarkHelper('https://www.google.com', 'googletest', 0);


  getWeather();

  // Set up the clock
  document.getElementById("clock").innerHTML = getTime();
  // Set clock interval to tick clock
  setInterval(() => {
    document.getElementById("clock").innerHTML = getTime();
  }, 1000);

  addListeners();
}

// document.documentElement.style.backgroundColor = '#83A06C';

browser.storage.local.get('backgroundColor').then((res) => {

  // document.documentElement.style.backgroundColor = '#83A06C';
  document.documentElement.style.backgroundColor = res.backgroundColor;

  // initPage();  
})

document.addEventListener('DOMContentLoaded', () => {
  initPage();
})

browser.storage.local.get('setNum').then((res) => {
  console.log(res.setNum)
})
