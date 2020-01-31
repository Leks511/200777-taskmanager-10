import BoardController from './controllers/board';

import BoardComponent from './components/board';
import FilterComponent from './components/filter';
import SiteMenuComponent from './components/site-menu';
// import SortComponent, {SortType} from './components/sort';

import {generateTasks} from './mock/task';
import {generateFilters} from './mock/filter';

import {render, RenderPosition} from './utils/render';

const TASK_COUNT = 22;

// Рендеринг шапки
const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);
render(siteHeaderElement, new SiteMenuComponent(), RenderPosition.BEFOREEND);

// Рендеринг фильтров
const filters = generateFilters();
render(siteMainElement, new FilterComponent(filters), RenderPosition.BEFOREEND);

// Рендеринг доски
const boardComponent = new BoardComponent();
render(siteMainElement, boardComponent, RenderPosition.BEFOREEND);

// Получаем данные тасков
const tasks = generateTasks(TASK_COUNT);

const boardController = new BoardController(boardComponent);

boardController.render(tasks);

/*
Курс завален, но задания для дальнейшего выполнения лучше открыть

Модуль 7 - таск 1

*/
