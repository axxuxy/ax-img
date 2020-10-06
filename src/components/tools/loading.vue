<template>
  <div ref="loading" v-show="state">
    <svg
      x="0"
      y="0"
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
    >
      <path
        :d="`M0,${height / 2}H${load_show}`"
        :stroke="color"
        :stroke-width="height"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: "loading",
  props: {
    height: {
      type: Number,
      default: 4
    },
    load: Object
  },
  data() {
    return {
      width: 0,
      loading: 0,
      set_loading: null,
      state: false
    };
  },
  watch: {
    load: {
      immediate: true,
      handler() {
        this.loading = 0;
        this.state = true;
      }
    },
    loaded: {
      immediate: true,
      handler(val) {
        if (val === 0) return (this.loading = 0);
        if (this.set_loading) return;
        this.set_loading = setInterval(() => {
          this._add_loading();
        }, 16);
      }
    }
  },
  computed: {
    color() {
      let load = this.load;
      if (!load) return "#36f";
      return load.state === "error" ? "red" : "#36f";
    },
    loaded() {
      let { load, state } = this;
      if (!state) return 0;
      state = load.state;
      if (state === "error") return 100;
      if (state === "ok") return 100;
      if (state === "start") return 18;
      if (state === "loading") return 5 + Math.floor(90 * load.loading);
      return 0;
    },
    load_show() {
      return Math.floor((this.loading * this.width) / 100);
    },
    add_loading() {
      let load = this.load;
      if (!load) return 100;
      let add;
      switch (load.state) {
        case "start":
          add = 0.2;
          break;
        case "loading":
          add = 1;
          break;
        case "ok":
          add = 3;
          break;
        case "error":
          add = 2;
          break;
        default:
          add = 100;
          break;
      }
      return add;
    }
  },
  methods: {
    _start() {
      let loading = this.$refs.loading;
      let observer = new ResizeObserver(entry => {
        this.width = entry[0].contentRect.width;
      });
      observer.observe(loading);
    },
    _add_loading() {
      let { loading, loaded } = this;
      if (loading >= loaded) {
        this.loading = loaded;
        if (loading >= 100) {
          this.loading = 0;
          this.state = false;
        }
        clearInterval(this.set_loading);
        this.set_loading = null;
        return;
      }
      this.loading = loading = loading + this.add_loading;
    }
  },
  mounted() {
    this._start();
  }
};
</script>
<style lang="scss" scoped>
div {
  width: 100%;
  height: 5px;
  background-color: #fff;
  svg {
    position: absolute;
    top: 1px;
    display: block;
    z-index: 101;
  }
}
</style>
