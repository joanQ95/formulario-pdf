import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { PDFDownloadLink, Document, Page, Text, Image } from "@react-pdf/renderer";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const { register, handleSubmit, reset } = useForm();
  const [formData, setFormData] = useState(null);
  const [images, setImages] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [historial, setHistorial] = useState([]);
  const webcamRef = useRef(null);
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
    const newImages = images.filter((_, i) => i !== index);
    const newDescriptions = { ...descriptions };
    delete newDescriptions[index];

    setImages(newImages);
    setDescriptions(newDescriptions);
    setCurrentPhoto(Math.max(currentPhoto - 1, 0));
  };

  const onSubmit = (data) => {
    const report = { ...data, images, descriptions };
    setHistorial([...historial, report]);
    setFormData(report);
    reset();
    setImages([]);
    setDescriptions({});
    setCurrentPhoto(0);
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

  return (
    <div className="container">
      <h2>Formulario de Inspección</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <input {...register("cliente", { required: true })} placeholder="Cliente" />
        <input {...register("referencia", { required: true })} placeholder="Referencia" />

        <div className="checkbox-container">
          <label><input type="checkbox" {...register("placaDatos")} /> Placa de Datos</label>
          <label><input type="checkbox" {...register("fugaAceite")} /> Fuga de Aceite</label>
        </div>

        <input {...register("marca", { required: true })} placeholder="Marca" />
        <input {...register("tipo", { required: true })} placeholder="Tipo" />
        <input {...register("serie", { required: true })} placeholder="Serie" />
        <input type="number" {...register("potencia", { required: true })} placeholder="Potencia (kW)" />
        <input {...register("ratio", { required: true })} placeholder="Ratio" />
        <input {...register("tipoAceite", { required: true })} placeholder="Tipo de Aceite" />
        <input type="number" {...register("cantidadAceite", { required: true })} placeholder="Cantidad de Aceite (L)" />

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

      {formData && (
        <PDFDownloadLink document={<MyPDF data={formData} />} fileName="inspeccion.pdf" className="download-btn">
          {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
        </PDFDownloadLink>
      )}

      <h2>Historial de Reportes</h2>
      <ul>
        {historial.map((report, index) => (
          <li key={index}>
            <strong>Cliente:</strong> {report.cliente} - <strong>Referencia:</strong> {report.referencia}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
