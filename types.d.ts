interface NodeProcessEnv {
  [key: string]: string | undefined;
}

declare const process: {
  env: NodeProcessEnv;
};
