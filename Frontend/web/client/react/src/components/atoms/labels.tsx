interface LabelProps {
  name: string;
  color?: string;
}

const Label = ({ name, color = "text-[#0F0F0F]" }: LabelProps) => {
      return (
        <>
          <label className={`block mb-[5px] text-sm font-medium ${color} tracking-[0.2px] leading-[20px]`}>{name}</label>
        </>
      )
}

export default Label;