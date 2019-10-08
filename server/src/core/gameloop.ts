
export const start = async () => {
  const handle = (msg: any) => {
    console.log('handle loop', msg);
  };

  process.on('message', handle);
};