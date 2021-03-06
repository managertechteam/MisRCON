import * as React from 'react';

let uniqueKey = 0; // unique number for an output given an instance of emulator

type Props = {
  outputRenderers: any;
  outputs: any;
  [key: string]: any;
};
const OutputList = ({
  outputRenderers,
  outputs,
  ...outputRendererProps
}: Props) => {
  return (
    <div className={'terminalOutput'}>
      {outputs.map((output: any) => {
        const type = output.get('type');
        const content = output.get('content');
        const date = output.get('date');
        // console.log(type, content, date);

        if (!outputRenderers.hasOwnProperty(type)) {
          throw new Error(
            `No output renderer set for ${type} in outputRenderers`
          );
        }

        const OutputComponent = outputRenderers[type];

        return (
          <OutputComponent
            key={uniqueKey++}
            {...outputRendererProps}
            content={content}
            date={date}
          />
        );
      })}
    </div>
  );
};

export default OutputList;
