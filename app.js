const express = require("express");
const app = express(); //we need to create the instance of the express
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path"); //this is the inbuilt core module to working with path
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
const format = require("format");
const isValid = require("date-fns/isValid");
const addDays = require("date-fns/addDays");
let db = null;
const intilizerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server has started at 3000 port");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

intilizerDbAndServer();

// var result = isValid(new Date(2014, 1, 31))

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const statusList = `
         SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE status='${status}';
      `;
      const statusListOne = await db.all(statusList);
      response.send(statusListOne);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const categoryList = `
         SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE priority='${priority}';
      `;
      const categoryListOne = await db.all(categoryList);
      response.send(categoryListOne);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    const statusdata =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    const prioritydata =
      priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
    if (statusdata === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }

    if (prioritydata === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
    if (statusdata === true && prioritydata === true) {
      const statuscategoryList = `
         SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE priority='${priority}' AND status='${status}';
      `;
      const statuscategoryListOne = await db.all(statuscategoryList);
      response.send(statuscategoryListOne);
    }
  } else if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== undefined
  ) {
    const searchdata = `
         SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
         FROM 
         todo
         WHERE todo LIKE '%${search_q}%'
      `;
    const searchone = await db.all(searchdata);
    response.send(searchone);
  } else if (
    category !== undefined &&
    status !== undefined &&
    priority === undefined &&
    search_q === undefined
  ) {
    const categorydata =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    const statusdata =
      status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
    if (categorydata === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }

    if (statusdata === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }

    if (statusdata === true && categorydata === true) {
      const statuscategory = `SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE status = '${status}' AND category= '${category}';`;
      const statuscategoryget = await db.all(statuscategory);
      response.send(statuscategoryget);
    }
  } else if (
    category !== undefined &&
    priority === undefined &&
    status === undefined &&
    search_q === undefined
  ) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const statuscategory = `SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE category = '${category}';`;
      const statuscategoryget = await db.all(statuscategory);
      response.send(statuscategoryget);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    const categorydata =
      category === "WORK" || category === "HOME" || category === "LEARNING";
    const prioritydata =
      priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";

    if (categorydata === true && prioritydata === true) {
      const statuscategory = `SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
         WHERE category = '${category}' AND priority = '${priority}';`;
      const statuscategoryget = await db.all(statuscategory);
      response.send(statuscategoryget);
    }

    if (categorydata === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
    if (prioritydata === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoOne = `
     SELECT 
          id,
          todo,category,priority,
          status,due_date AS dueDate
        FROM 
         todo
        WHERE id =${todoId} 
    `;
  const todoGetOne = await db.get(todoOne);
  response.send(todoGetOne);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const validornot = isValid(new Date(date));
  console.log(validornot);
  if (validornot === true) {
    const result_date = format(new Date(date), "yyyy-MM-dd");
    console.log(result_date);
    const datelist = `
      SELECT
            id,
            todo,category,priority,
            status,due_date AS dueDate
          FROM
           todo
          WHERE due_date ='${result_date}';
    `;
    const datelistone = await db.all(datelist);
    response.send(datelistone);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const priority_data =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const status_data =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const category_data =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const valid_data = isValid(new Date(dueDate));
  if (priority_data === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (status_data === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (category_data === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  }
  if (valid_data === false) {
    response.status(400);
    response.send("Invalid Due Date");
  }
  if (
    status_data === true &&
    category_data === true &&
    valid_data === true &&
    priority_data === true
  ) {
    const format_data = format(new Date(dueDate), "yyyy-MM-dd");
    const newTodo = `
     INSERT INTO todo (
         id,todo,priority,status,category,due_date 
     )
     VALUES 
      (${id},'${todo}','${priority}','${status}','${category}','${format_data}');
  `;
    await db.run(newTodo);
    response.send("Todo Successfully Added");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletetodo = `
        DELETE 
        FROM 
        todo 
        WHERE id = ${todoId}
    `;
  await db.run(deletetodo);
  response.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (
    status !== undefined &&
    priority === undefined &&
    todo === undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const updatestatus = `
         UPDATE todo 
         SET status = '${status}'
         WHERE id=${todoId};
        `;
      await db.run(updatestatus);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (
    status === undefined &&
    priority !== undefined &&
    todo === undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const updatepriority = `
         UPDATE todo 
         SET priority = '${priority}'
         WHERE id=${todoId}
        `;
      await db.run(updatepriority);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (
    status === undefined &&
    priority === undefined &&
    todo !== undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    const updatepriority = `
         UPDATE todo 
         SET todo = '${todo}'
         WHERE id=${todoId}
        `;
    await db.run(updatepriority);
    response.send("Todo Updated");
  } else if (
    status === undefined &&
    priority === undefined &&
    todo === undefined &&
    category !== undefined &&
    dueDate === undefined
  ) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const updatecateogry = `
         UPDATE todo 
         SET category = '${category}'
         WHERE id=${todoId}
        `;
      await db.run(updatecateogry);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    const result = isValid(new Date(dueDate));
    if (result === true) {
      const result_date = format(new Date(dueDate), "yyyy-MM-dd");
      const updatedate = `
      UPDATE todo 
         SET due_date = '${result_date}'
         WHERE id=${todoId}
      `;
      await db.run(updatedate);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

module.exports = app;
