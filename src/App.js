import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PDFDownloadLink, Document, Page, Text, Image, pdf } from "@react-pdf/renderer";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  
  const [images, setImages] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [historialPDFs, setHistorialPDFs] = useState([]);
  const webcamRef = React.useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImages([...images, imageSrc]);
  };

  const confirmPhoto = () => {
    if (!images[currentPhoto] || !descriptions[currentPhoto]) {
      alert("Debes capturar una foto y escribir una descripción antes de continuar.");
      return;
    }
    setCurrentPhoto(currentPhoto + 1);
  };

  const deletePhoto = (index) => {
    setImages(images.filter((_, i) => i !== index));
    const newDescriptions = { ...descriptions };
    delete newDescriptions[index];
    setDescriptions(newDescriptions);
    setCurrentPhoto(Math.max(currentPhoto - 1, 0));
  };

  const MyPDF = ({ data }) => (
    <Document>
      <Page style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Informe de Inspección</Text>
        <Text>Cliente: {data.cliente}</Text>
        <Text>Referencia: {data.referencia}</Text>
        <Text>Placa de Datos: {data.placaDatos ? "Sí" : "No"}</Text>
        <Text>Fuga de Aceite: {data.fugaAceite ? "Sí" : "No"}</Text>
        <Text>Marca: {data.marca}</Text>
        <Text>Tipo: {data.tipo}</Text>
        <Text>Serie: {data.serie}</Text>
        <Text>Potencia (kW): {data.potencia}</Text>
        <Text>Ratio: {data.ratio}</Text>
        <Text>Tipo de Aceite: {data.tipoAceite}</Text>
        <Text>Cantidad de Aceite (L): {data.cantidadAceite}</Text>

        {data.images.map((img, index) => (
          <React.Fragment key={index}>
            <Text>Foto {index + 1}: {data.descriptions[index]}</Text>
            <Image src={img} style={{ width: 200, height: 150, marginVertical: 10 }} />
          </React.Fragment>
        ))}
      </Page>
    </Document>
  );

  const onSubmit = async (data) => {
    const report = { ...data, images, descriptions };
    
    const blob = await pdf(<MyPDF data={report} />).toBlob();
    const url = URL.createObjectURL(blob);

    setHistorialPDFs([...historialPDFs, { cliente: data.cliente, referencia: data.referencia, url }]);

    reset();
    setImages([]);
    setDescriptions({});
    setCurrentPhoto(0);
  };

  return (
    <div className="container">
      <h2>Formulario de Inspección</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div>
          <input
            {...register("cliente", { required: "Este campo es obligatorio" })}
            placeholder="Cliente"
            className={errors.cliente ? "error" : ""}
          />
          {errors.cliente && <span className="error-message">{errors.cliente.message}</span>}
        </div>

        <div>
          <input
            {...register("referencia", { required: "Este campo es obligatorio" })}
            placeholder="Referencia"
            className={errors.referencia ? "error" : ""}
          />
          {errors.referencia && <span className="error-message">{errors.referencia.message}</span>}
        </div>

        <div className="checkbox-container">
          <label><input type="checkbox" {...register("placaDatos")} /> Placa de Datos</label>
          <label><input type="checkbox" {...register("fugaAceite")} /> Fuga de Aceite</label>
        </div>

        <div>
          <input
            {...register("marca", { required: "Este campo es obligatorio" })}
            placeholder="Marca"
            className={errors.marca ? "error" : ""}
          />
          {errors.marca && <span className="error-message">{errors.marca.message}</span>}
        </div>

        <input {...register("tipo", { required: true })} placeholder="Tipo" className={errors.tipo ? "error" : ""} />
        <input {...register("serie", { required: true })} placeholder="Serie" className={errors.serie ? "error" : ""} />
        <input type="number" {...register("potencia", { required: true })} placeholder="Potencia (kW)" className={errors.potencia ? "error" : ""} />

        <h3>Registro Fotográfico</h3>
        {showCamera ? (
          <>
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="webcam" />
            <button type="button" onClick={capture}>Capturar Foto</button>
          </>
        ) : (
          <button type="button" onClick={() => setShowCamera(true)}>Activar Cámara</button>
        )}

        {images.map((img, index) => (
          <div key={index} className="image-container">
            <img src={img} alt={`Foto ${index + 1}`} className="preview" />
            <input
              type="text"
              placeholder="Agregar descripción"
              onChange={(e) => setDescriptions({ ...descriptions, [index]: e.target.value })}
            />
            <button type="button" className="delete-btn" onClick={() => deletePhoto(index)}>❌</button>
          </div>
        ))}

        {currentPhoto < 5 && images.length === currentPhoto && (
          <button type="button" onClick={confirmPhoto}>Confirmar Foto {currentPhoto + 1}</button>
        )}

        <button type="submit">Generar PDF</button>
      </form>

      <h2>Historial de PDFs Generados</h2>
      <ul>
        {historialPDFs.map((pdf, index) => (
          <li key={index}>
            <strong>{pdf.cliente} - {pdf.referencia}</strong>
            <a href={pdf.url} download={`Reporte_${pdf.cliente}.pdf`} className="download-btn">Descargar PDF</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
