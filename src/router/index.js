import Vue from "vue";
import VueRouter from "vue-router";
import Posts from "views/Posts";
import posts from "components/posts";
import Down from "views/Down";

Vue.use(VueRouter);

const routes = [
  {
    path: "/posts/:website",
    component: Posts,
    children: [
      {
        path: "",
        component: posts
      },
      {
        path: ":tag",
        component: posts
      }
    ]
  },
  {
    path: "/down",
    component: Down
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
