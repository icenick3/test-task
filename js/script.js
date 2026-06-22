$(function() {
    // Ініціалізація Datepicker
    $("#datepicker_1, #datepicker_2").datepicker({
        dateFormat: 'd-mm-yy',
        // Викликаємо фільтрацію одразу при виборі дати
        onSelect: function(dateText, inst) {
            filterByDate();
        },
        beforeShow: function(input, inst) {
            $(input).closest('.input_block').find('.imgs img').attr('src', 'img/close.png');
            $(input).data('is-open', true);
        },
        onClose: function(dateText, inst) {
            $(inst.input).closest('.input_block').find('.imgs img').attr('src', 'img/calendar.png');
            setTimeout(function() {
                $(inst.input).data('is-open', false);
            }, 150);

            // Про всяк випадок викликаємо фільтрацію при закритті
            filterByDate();
        }
    });

    // Логіка відкриття/закриття по кліку на іконку
    $('.input_block .imgs img').on('click', function(e) {
        var $input = $(this).closest('.input_block').find('input');

        if ($input.data('is-open')) {
            $input.datepicker('hide');
        } else {
            $input.datepicker('show');
        }
    });
});

// Допоміжна функція для форматування дати у вигляд DD-MM-YYYY
function formatDate(dateObj) {
    let d = dateObj.getDate().toString().padStart(2, '0');
    let m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    let y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
}

// 1. Генерація масиву з 8 коментарів із випадковими датами (тільки 2026 рік)
let commentsData = [];
for (let i = 1; i <= 8; i++) {
    // Генеруємо випадкову дату з 1 січня 2026 по 31 грудня 2026
    let start = new Date(2026, 0, 1).getTime();
    let end = new Date(2026, 11, 31, 23, 59, 59).getTime();
    let randomDate = new Date(start + Math.random() * (end - start));

    commentsData.push({
        id: i,
        avatar: `img/c${i}.png`,
        dateObj: randomDate,
        dateStr: formatDate(randomDate),
        uploadDate: '11-04-2026', // Початкова дата завантаження теж 2026 рік
        likes: Math.floor(Math.random() * 200),
        messages: Math.floor(Math.random() * 50)
    });
}

// 2. Сортування від меншої (найдавнішої) до більшої дати
commentsData.sort((a, b) => a.dateObj - b.dateObj);

// Контейнер, куди будемо рендерити коментарі
const listContainer = document.getElementById('commentsList');

// 3. Функція рендеру списку
function renderComments(data) {
    listContainer.innerHTML = '';

    data.forEach(c => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';

        commentDiv.innerHTML = `
            <img alt="avatar" src="${c.avatar}" class="avatar">
            <div class="comment_blocks">
             <div class="mob_date">
                <div class="comment_block today">
                    <p class="comment_text">Today</p>
                    <div>
                        <div><img alt="" src="img/heart.png"><p>${c.likes}</p></div>
                        <div><img alt="" src="img/message.png"><p>${c.messages}</p></div>
                    </div>
                </div>
                <div class="comment_block date">
                    <p class="comment_text">${c.dateStr}</p>
                    <div>
                        <div><img alt="" src="img/heart.png"><p>${c.likes}</p></div>
                        <div><img alt="" src="img/message.png"><p>${c.messages}</p></div>
                    </div>
                </div>
                </div>
                <div class="comment_block upload">
                    <p class="comment_text">Image upload</p>
                    <p class="upload_date">${c.uploadDate}</p>
                </div>
            </div>
        `;

        listContainer.appendChild(commentDiv);
    });
}

// Первинний рендер
renderComments(commentsData);

// 4. Логіка фільтрації за часовим проміжком
function filterByDate() {
    let fromDate = null;
    let toDate = null;

    // Спеціальний парсинг дати з формату 'd-mm-yy' за допомогою jQuery UI
    try {
        const valFrom = $('#datepicker_1').val();
        if (valFrom) {
            fromDate = $.datepicker.parseDate('d-mm-yy', valFrom);
        }

        const valTo = $('#datepicker_2').val();
        if (valTo) {
            toDate = $.datepicker.parseDate('d-mm-yy', valTo);
            // Встановлюємо час на кінець дня (23:59:59), щоб включити весь обраний день
            toDate.setHours(23, 59, 59, 999);
        }
    } catch (e) {
        console.warn("Некоректний формат дати");
    }

    const filteredData = commentsData.filter(c => {
        let isValid = true;

        if (fromDate && c.dateObj < fromDate) {
            isValid = false;
        }

        if (toDate && c.dateObj > toDate) {
            isValid = false;
        }

        return isValid;
    });

    renderComments(filteredData);
}

// Ручне введення дат (якщо користувач вводить з клавіатури, а не через календар)
document.getElementById('datepicker_1').addEventListener('input', filterByDate);
document.getElementById('datepicker_2').addEventListener('input', filterByDate);


// Отримуємо необхідні елементи
const btnBlocks = document.getElementById('bloks');
const btnList = document.getElementById('list');
const commentsContainer = document.getElementById('commentsList');

// Допоміжна функція для включення режиму 'blocks'
function setBlocksLayout() {
    commentsContainer.className = 'blocks';
    btnBlocks.src = 'img/blocks_active.png';
    btnList.src = 'img/list.png';
}

// Функція для перевірки ширини екрану
function checkWidth() {
    if (window.innerWidth < 600) {
        setBlocksLayout();
    }
}

// Викликаємо перевірку одразу при завантаженні
checkWidth();

// Слухаємо подію зміни розміру вікна
window.addEventListener('resize', checkWidth);

// Обробник кліку для вигляду "blocks"
btnBlocks.addEventListener('click', function() {
    setBlocksLayout();
});

// Обробник кліку для вигляду "list"
btnList.addEventListener('click', function() {
    // Якщо ширина менше 600px, забороняємо перемикання на 'list'
    if (window.innerWidth < 600) return;

    // Змінюємо клас контейнера
    commentsContainer.className = 'list';

    // Оновлюємо картинки (робимо list активним, blocks - звичайним)
    btnList.src = 'img/list_active.png';
    btnBlocks.src = 'img/blocks.png';
});