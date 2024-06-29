import { useEffect, useRef, useState } from "react";
import Styles from "./TextEditor.module.css";
import axios from "axios";

interface FontStyleData {
  [key: string]: any;
}

const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontStylesData, setFontStylesData] = useState<FontStyleData>({});
  const [fontStylesTypes, setFontStylesTypes] = useState<string[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>("");
  const [allVarients, setAllVarients] = useState<string[]>([]);
  const [selectedVarient, setSelectedVarient] = useState<string>("");
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [isToggleEnabled, setIsToggleEnabled] = useState<boolean>(false);

  const handleToggle = () => {
    if (isToggleEnabled) {
      if (isToggled) {
        allVarients.forEach((e) => {
          if (!e.endsWith("italic")) {
            setSelectedVarient(e);
            localStorage.setItem("selectedVarient", e);
          }
        });
      } else {
        allVarients.forEach((e) => {
          if (e.endsWith("italic")) {
            setSelectedVarient(e);
            localStorage.setItem("selectedVarient", e);
          }
        });
      }
      setIsToggled(!isToggled);
    }
  };

  const customFontStyle =
    fontStylesTypes.length > 0 &&
    selectedVarient &&
    selectedFont &&
    `
    @font-face {
      font-family: '${selectedFont}';
      src: url(${fontStylesData[selectedFont][selectedVarient]}) format('woff2');
      font-weight: normal;
      font-style: normal;
    }
  `;

  const getFontStyle = async () => {
    try {
      const fontData = await axios.get("/punt-frontend-assignment.json");
      const allStylesFamilyType: string[] = Object.keys(fontData.data);
      if (
        localStorage.getItem("selectedFont") &&
        fontData.data[localStorage.getItem("selectedFont") || ""]
      ) {
        const allVarients = Object.keys(
          fontData.data[localStorage.getItem("selectedFont") || ""]
        );

        let count = 0;
        allVarients.forEach((e) => {
          if (e.endsWith("italic")) {
            count++;
          }
        });
        if (count) {
          setIsToggleEnabled(true);
        } else {
          setIsToggleEnabled(false);
        }
        setAllVarients(allVarients);
      }
      setFontStylesData(fontData.data);
      setFontStylesTypes(allStylesFamilyType);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFontStyle();
  }, []);

  const handleSelectFont = (styleKey: string) => {
    setSelectedFont(styleKey);
    if (styleKey && fontStylesData[styleKey]) {
      const allVarients = Object.keys(fontStylesData[styleKey]);
      let count = 0;
      allVarients.forEach((e) => {
        if (e.endsWith("italic")) {
          count++;
        }
      });
      if (count) {
        setIsToggleEnabled(true);
      } else {
        setIsToggleEnabled(false);
      }
      setAllVarients(allVarients);
      setSelectedVarient(allVarients[0]);
      localStorage.setItem("selectedFont", styleKey);
      localStorage.setItem("selectedVarient", allVarients[0]);
    } else {
      setAllVarients([]);
    }
  };

  const handleVarient = (varient: string) => {
    if (varient.endsWith("italic")) {
      setIsToggled(true);
    } else {
      setIsToggled(false);
    }
    localStorage.setItem("selectedVarient", varient);
    setSelectedVarient(varient);
  };

  useEffect(() => {
    if (editorRef.current && selectedFont && selectedVarient) {
      editorRef.current.style.fontFamily = `${selectedFont}, sans-serif`;
    }
  }, [selectedFont, selectedVarient]);
  useEffect(() => {
    const handleInput = () => {
      if (editorRef.current) {
        localStorage.setItem("content", editorRef.current?.innerText);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("input", handleInput);
    }
    return () => {
      if (editor) {
        editor.removeEventListener("input", handleInput);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = localStorage.getItem("content");
    }
    if (!selectedFont || !selectedVarient) {
      if (localStorage.getItem("selectedVarient")?.endsWith("italic")) {
        setIsToggled(true);
      }
      setSelectedFont(localStorage.getItem("selectedFont") || "");
      setSelectedVarient(localStorage.getItem("selectedVarient") || "");
    }
  }, []);

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.textContent = "";
    }
    setIsToggled(false);
    setSelectedFont("");
    setSelectedVarient("");
    localStorage.setItem("content", "");
    localStorage.setItem("selectedFont", "");
    localStorage.setItem("selectedVarient", "");
  };
  const handleAdd = () => {
    localStorage.setItem("selectedFont", selectedFont);
    localStorage.setItem("selectedVarient", selectedVarient);
  };

  return (
    <div>
      <style>{customFontStyle}</style>
      <h1 className={Styles.textEditorHeading}>Text Editor</h1>
      <div>
        <div className={Styles.selectorDivWrapper}>
          <div className={Styles.selectorDiv}>
            <span>Font Family</span>
            <select
              value={selectedFont}
              onChange={(e) => handleSelectFont(e.target.value)}
            >
              <option value="">Select Font Type</option>
              {fontStylesTypes.map((ele, index) => (
                <option value={ele} key={index}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.selectorDiv}>
            <span>Varient</span>
            <select
              value={selectedVarient}
              onChange={(e) => handleVarient(e.target.value)}
              disabled={selectedFont === ""}
            >
              {selectedFont === "" && (
                <option value={""}>Select Varient</option>
              )}
              {allVarients.map((ele, index) => (
                <option value={ele} key={index}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.toggleSwitch} onClick={handleToggle}>
            <div
              style={{
                backgroundColor: isToggleEnabled ? "" : "rgb(230, 223, 223)",
              }}
              className={`${Styles.switch} ${
                isToggled ? Styles.on : Styles.off
              }`}
            ></div>
          </div>
        </div>
        <div ref={editorRef} contentEditable className={Styles.editor} />
      </div>
      <div className={Styles.bottomButtons}>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleAdd}>Save</button>
      </div>
    </div>
  );
};

export default TextEditor;
