<template>
  <img
    :src="img"
    @error="error = true"
    :loading="laze ? 'lazy' : ''"
    @mouseover="_move"
    @click="_click"
  />
</template>

<script type="text/ecmascript-6">
import defaultImg from "assets/img/default.svg";

export default {
  name: "v-img",
  props: {
    src: String,
    loadcount: {
      type: Number,
      default: 5
    },
    defuultImg: {
      type: String,
      default: defaultImg
    },
    reloadtime: {
      type: Number,
      default: 5000
    },
    laze: {
      type: Boolean,
      default: true
    },
    clickReload: {
      type: Boolean,
      default: false
    },
    moveReload: {
      type: Boolean,
      default: false
    },
    clickStop:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      count: 0,
      error: false
    };
  },
  watch: {
    error(val) {
      if (val && this.count++ < this.loadcount)
        setTimeout(() => {
          this.error = false;
        }, this.reloadtime);
    }
  },
  computed: {
    img() {
      let { error, src } = this;
      return error ? defaultImg : src;
    }
  },
  methods: {
    _move() {
      if (this.moveReload) this.error = false;
    },
    _click(ev) {
      let {clickReload,clickStop}=this;
      if(clickStop)ev.stopPropagation();
      if (clickReload) this.error = false;
    }
  }
};
</script>
