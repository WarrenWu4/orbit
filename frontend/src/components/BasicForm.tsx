import React from "react";

interface BasicFormProps {
    formTitle: string;
    formItems: {formLabel: string; formInput: React.ReactNode;}[];
    submitFunction: (e: React.FormEvent) => void;
}

export default function BasicForm({formTitle, formItems, submitFunction}: BasicFormProps) {
    return (
        <div className="border-4 border-white p-4">
            <h1 className="text-2xl font-bold mb-4">
                {formTitle}
            </h1>

            <form className="flex flex-col gap-y-4" onSubmit={submitFunction}>

                {formItems.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-col gap-y-1">
                            <label>
                                {item.formLabel}
                            </label>
                            {item.formInput}
                        </div>
                    )
                })}

                <button type="submit" className="bg-black text-white py-2 rounded-md">
                    Submit
                </button>

            </form>
        </div>
    )
}