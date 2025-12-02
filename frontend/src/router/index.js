import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "../services/auth.service";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/BookList.vue")
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue")
  },
  {
    path: "/user/register",
    name: "register",
    component: () => import("../views/user/UserRegister.vue")
  },
  {
    path: "/user/profile",
    name: "userprofile",
    component: () => import("../views/user/UserProfile.vue")
  },
  {
    path: "/userprofile/edit/:id",
    name: "userprofile.edit",
    component: () => import("../views/user/UserProfileEdit.vue"),
    meta: {
      requiresAuth: true
    },
    props: true
  },
  {
    path: "/staff/profile",
    name: "staffprofile",
    component: () => import("../views/staff/StaffProfile.vue")
  },
  {
    path: "/staff/edit/:id",
    name: "staffprofile.edit",
    component: () => import("../views/staff/StaffProfileEdit.vue"),
    meta: {
      requiresAuth: true
    },
    props: true
  },
  {
    path: "/book/add",
    name: "book.add",
    component: () => import("../views/staff/BookAdd.vue")
  },
  {
    path: "/book/edit/:id",
    name: "book.edit",
    component: () => import("../views/staff/BookEdit.vue"),
    meta: {
      requiresAuth: true
    },
    props: true
  },
  {
    path: "/borrow/add/:id",
    name: "borrow.add",
    component: () => import("../views/user/BorrowAdd.vue"),
    props: true,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/borrowcheck",
    name: "borrow.check",
    component: () => import("../views/user/BorrowCheck.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/borrowpending",
    name: "borrow.pending",
    component: () => import("../views/staff/BorrowPending.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/borrow/edit/:id",
    name: "borrow.edit",
    component: () => (import("../views/staff/BorrowEdit.vue")),
    props: true,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/publishers",
    name: "publisher.list",
    component: () => import("../views/staff/PublisherList.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/publisher/add",
    name: "publisher.add",
    component: () => import("../views/staff/PublisherAdd.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/publisher/edit/:id",
    name: "publisher.edit",
    component: () => import("../views/staff/PublisherEdit.vue"),
    props: true,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/users",
    name: "user.list",
    component: () => import("../views/staff/UserList.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/staffs",
    name: "staff.list",
    component: () => import("../views/staff/StaffList.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/staff/add",
    name: "staff.add",
    component: () => import("../views/staff/StaffAdd.vue"),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/book/detail/:id",
    name: "book.detail",
    component: () => import("../views/BookDetail.vue"),
    meta: {
      requiresAuth: true
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next("/user/login");
  } else {
    next();
  }
});


export default router;