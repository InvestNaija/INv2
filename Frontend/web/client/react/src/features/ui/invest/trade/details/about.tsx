interface AboutProps {
  description?: string | null;
}

const About = ({ description }: AboutProps) => {
  return (
    <>
      <div>
        <div className="mt-[2px]">
          <div className="text-[16px] text-(--text-content-default) font-normal leading-[24px] mt-[10px]">
            <span>
              {description || "No description available for this security."}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
