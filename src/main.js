import BoardComponent from './components/board.js';
import FilterComponent from './components/filter.js';
import LoadMoreButtonComponent from './components/load-more-button.js';
import SiteMenuComponent from './components/site-menu.js';
import TaskEditComponent from './components/task-edit.js';
import TaskComponent from './components/task.js';
import {generateTasks} from './mock/task.js';
import {generateFilters} from './mock/filter';

import { render, RenderPosition } from './util';

const TASK_COUNT = 22;

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, createSiteMenuTemplate(), `beforeend`);

const filters = generateFilters();

render(siteMainElement, createFilterTemplate(filters), `beforeend`);
render(siteMainElement, createBoardTemplate(), `beforeend`);

const taskListElement = siteMainElement.querySelector(`.board__tasks`);
const tasks = generateTasks(TASK_COUNT);

render(taskListElement, createTaskEditTemplate(tasks[0]), `beforeend`);
tasks.slice(1).forEach((task) => render(taskListElement, createTaskTemplate(task), `beforeend`));

const boardElement = siteMainElement.querySelector(`.board`);
render(boardElement, createLoadMoreButtonTemplate(), `beforeend`);
