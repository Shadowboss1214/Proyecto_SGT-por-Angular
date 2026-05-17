<?php

namespace employees\V1\Rpc\Qr;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\ApiTools\ContentNegotiation\ViewModel;

class QrController extends AbstractActionController
{
    private string $frontendBase = 'http://localhost:4200/app/admin';

    public function qrAction()
    {
        $entity = $this->params()->fromRoute('entity', '');
        $id     = (int) $this->params()->fromRoute('id', 0);

        $allowed = ['employee', 'transport', 'trips'];
        if (!in_array($entity, $allowed, true) || $id <= 0) {
            $this->getResponse()->setStatusCode(400);
            return new ViewModel(['error' => 'Entidad o ID inválidos']);
        }

        $targetUrl = "{$this->frontendBase}/{$entity}/{$id}";

        try {
            $writer = new \Endroid\QrCode\Writer\PngWriter();
            $qrCode = \Endroid\QrCode\QrCode::create($targetUrl)
                ->setSize(256)
                ->setMargin(10);
            $result  = $writer->write($qrCode);
            $dataUri = $result->getDataUri();
        } catch (\Throwable $e) {
            $this->getResponse()->setStatusCode(503);
            return new ViewModel([
                'error'      => 'Librería QR no disponible. Ejecutar: composer require endroid/qr-code',
                'target_url' => $targetUrl,
            ]);
        }

        return new ViewModel(['data_url' => $dataUri, 'target_url' => $targetUrl]);
    }
}
